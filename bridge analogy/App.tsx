
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Exercise, Score, PlayerAnalogy, GameState } from './types';
import { judgeAnalogy, generateExercise, setApiKey, setModel } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import ScoreBar from './components/ScoreBar';
import { RelationIcon, DistanceIcon, CoherenceIcon, HintIcon, BanIcon } from './components/GameIcons';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
    const [isFromHub, setIsFromHub] = useState(false);
    const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
    const [playerAnalogy, setPlayerAnalogy] = useState<PlayerAnalogy>({ c: '', d: '' });
    const [scores, setScores] = useState<Score | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [round, setRound] = useState(0);
    const [usedRuleIds, setUsedRuleIds] = useState<string[]>([]);

    const handleStartGame = useCallback(async () => {
        // Ensure API key is set before starting
        const urlParams = new URLSearchParams(window.location.search);
        const apiKeyFromUrl = urlParams.get('apiKey');
        if (apiKeyFromUrl) {
            setApiKey(apiKeyFromUrl);
        }
        
        setGameState(GameState.GENERATING_EXERCISE);
        setError(null);
        try {
            const newExercise = await generateExercise([]);
            setCurrentExercise(newExercise);
            setUsedRuleIds([newExercise.rule_id]);
            setRound(1);
            setGameState(GameState.PLAYING);
        } catch (err) {
            setError((err as Error).message);
            setGameState(GameState.ERROR);
        }
    }, []);

    const handleSubmitAnalogy = async () => {
        if (!currentExercise || !playerAnalogy.c || !playerAnalogy.d) {
            setError("Please complete the analogy.");
            return;
        }
        setError(null);
        setGameState(GameState.JUDGING);
        try {
            const result = await judgeAnalogy(currentExercise, playerAnalogy);
            setScores(result);
            setGameState(GameState.FEEDBACK);
            // Notify parent hub that round is complete
            // Win criteria: weighted score >= 70%
            if (window.parent !== window) {
                const weightedScore = (result.relation_score * 0.6 + result.distance_score * 0.3 + result.coherence_score * 0.1);
                const isWin = weightedScore >= 0.7; // 70% threshold for a win
                window.parent.postMessage({ 
                    type: 'ROUND_COMPLETE', 
                    result: isWin ? 'win' : 'loss',
                    score: Math.round(weightedScore * 100),
                    source: 'bridge-analogy'
                }, '*');
            }
        } catch (err) {
            setError((err as Error).message);
            setGameState(GameState.ERROR);
        }
    };
    
    const handleNextRound = useCallback(async () => {
        setPlayerAnalogy({ c: '', d: '' });
        setScores(null);
        setGameState(GameState.GENERATING_EXERCISE);
        setRound(prev => prev + 1);
        try {
            const newExercise = await generateExercise(usedRuleIds);
            setCurrentExercise(newExercise);
            setUsedRuleIds(prev => [...prev, newExercise.rule_id]);
            setGameState(GameState.PLAYING);
        } catch (err) {
             setError((err as Error).message);
             setGameState(GameState.ERROR);
        }
    }, [usedRuleIds]);

    const handleReset = () => {
        setGameState(GameState.IDLE);
        setCurrentExercise(null);
        setPlayerAnalogy({ c: '', d: '' });
        setScores(null);
        setError(null);
        setRound(0);
        setUsedRuleIds([]);
    };

    // Check for hub integration and auto-start
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const fromHub = urlParams.get('hub') === 'true' || urlParams.get('autostart') === 'true';
        setIsFromHub(fromHub);
        
        // Get API key and model from URL params
        const apiKeyFromUrl = urlParams.get('apiKey');
        if (apiKeyFromUrl) {
            setApiKey(apiKeyFromUrl);
        }
        const modelFromUrl = urlParams.get('model');
        if (modelFromUrl) {
            setModel(modelFromUrl);
        }
        
        // Listen for hub settings
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'HUB_SETTINGS') {
                setIsFromHub(true);
                // Set API key if provided via postMessage
                if (event.data.apiKey) {
                    setApiKey(event.data.apiKey);
                }
                // Set model if provided via postMessage
                if (event.data.model) {
                    setModel(event.data.model);
                }
                // Auto-start after a brief delay to ensure API key is set
                if (event.data.autostart && gameState === GameState.IDLE) {
                    setTimeout(() => {
                        handleStartGame();
                    }, 100);
                }
            }
        };
        
        window.addEventListener('message', handleMessage);
        
        // Auto-start if from hub
        if (fromHub && gameState === GameState.IDLE) {
            handleStartGame();
        }
        
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const weightedScore = useMemo(() => {
        if (!scores) return 0;
        return (
            scores.relation_score * 0.6 +
            scores.distance_score * 0.3 +
            scores.coherence_score * 0.1
        );
    }, [scores]);

    const renderContent = () => {
        switch (gameState) {
            case GameState.IDLE:
                return (
                    <div className="text-center">
                        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500 mb-4">Bridge the Worlds</h1>
                        <p className="text-slate-400 mb-8 max-w-xl mx-auto">An AI-powered game to train your relational thinking. Connect concepts across different domains and see how you score.</p>
                        <button onClick={handleStartGame} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-cyan-500/30 transition-transform transform hover:scale-105">
                            Start Training
                        </button>
                    </div>
                );
            case GameState.GENERATING_EXERCISE:
                return (
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-slate-300 font-medium">Generating a new challenge...</p>
                    </div>
                );
            
            case GameState.PLAYING:
            case GameState.JUDGING:
                if (!currentExercise) return null;
                const [baseA, baseB] = currentExercise.base_pair;
                return (
                    <div className="w-full max-w-2xl mx-auto">
                        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 relative">
                            {gameState === GameState.JUDGING && (
                                <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm flex flex-col justify-center items-center rounded-xl z-10">
                                    <LoadingSpinner />
                                    <p className="mt-4 text-slate-300 font-medium">The AI is judging your analogy...</p>
                                </div>
                            )}
                            <div className="text-center mb-6">
                                <p className="text-slate-400 mb-2">Bridge the analogy:</p>
                                <div className="flex justify-center items-center text-4xl font-bold gap-4">
                                    <span>{baseA}</span>
                                    <span className="text-cyan-400">:</span>
                                    <span>{baseB}</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-2 italic">"{currentExercise.rubric}"</p>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <input
                                    type="text"
                                    value={playerAnalogy.c}
                                    onChange={(e) => setPlayerAnalogy(p => ({ ...p, c: e.target.value }))}
                                    placeholder="Your C"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-lg text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                                <span className="text-cyan-400 text-3xl font-bold">:</span>
                                <input
                                    type="text"
                                    value={playerAnalogy.d}
                                    onChange={(e) => setPlayerAnalogy(p => ({ ...p, d: e.target.value }))}
                                    placeholder="Your D"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-lg text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                            <button onClick={handleSubmitAnalogy} disabled={gameState === GameState.JUDGING} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-cyan-500/30 transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed">
                                Submit
                            </button>

                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="bg-slate-900/50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-cyan-400 mb-2 flex items-center gap-2"><HintIcon className="w-5 h-5"/> Domain Hints</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {currentExercise.domain_hints.map(h => <span key={h} className="bg-slate-700 px-2 py-1 rounded">{h}</span>)}
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2"><BanIcon className="w-5 h-5"/> Banned Concepts</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {currentExercise.bans.map(b => <span key={b} className="bg-slate-700 px-2 py-1 rounded">{b}</span>)}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                );
            case GameState.FEEDBACK:
                if (!scores || !currentExercise) return null;
                const totalScorePercentage = Math.round(weightedScore * 100);
                 return (
                    <div className="w-full max-w-2xl mx-auto">
                        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
                             <h2 className="text-3xl font-bold text-center mb-2">Round Complete!</h2>
                             <p className="text-center text-slate-400 mb-6">Your Analogy: <span className="font-semibold text-slate-200">{playerAnalogy.c} : {playerAnalogy.d}</span></p>

                             <div className="space-y-4 mb-6">
                                 <ScoreBar label="Relational Match" score={scores.relation_score} color="bg-violet-500" Icon={RelationIcon} />
                                 <ScoreBar label="Surface Distance" score={scores.distance_score} color="bg-emerald-500" Icon={DistanceIcon} />
                                 <ScoreBar label="Creative Coherence" score={scores.coherence_score} color="bg-amber-500" Icon={CoherenceIcon} />
                             </div>

                             <div className="text-center bg-slate-900/50 rounded-lg p-4 my-6">
                                <p className="text-slate-400 text-sm">Total Score</p>
                                <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">{totalScorePercentage}</p>
                             </div>

                             <div className="text-center bg-slate-700/50 p-4 rounded-lg mb-8">
                                <p className="font-semibold text-cyan-300 mb-1">AI Feedback:</p>
                                <p className="text-slate-300 italic">"{scores.summary}"</p>
                             </div>

                             <button onClick={handleNextRound} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-cyan-500/30 transition-transform transform hover:scale-105">
                                Next Round
                            </button>
                        </div>
                    </div>
                );
            case GameState.ERROR:
                return (
                     <div className="text-center bg-red-900/50 border border-red-500 p-8 rounded-xl max-w-md mx-auto">
                        <h2 className="text-2xl font-bold text-red-400 mb-4">An Error Occurred</h2>
                        <p className="text-slate-300 mb-6">{error}</p>
                         <button onClick={handleReset} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg">
                            Restart Game
                        </button>
                    </div>
                )

        }
    };


    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center p-4">
            {renderContent()}
        </main>
    );
};

export default App;