
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CalculationResult } from './types';

const App: React.FC = () => {
  const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('theme');
      if (typeof storedPrefs === 'string') return storedPrefs as 'light' | 'dark';
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [multiplier, setMultiplier] = useState<number>(2);
  const historyRef = useRef<HTMLDivElement>(null);

  // Mode state
  type Mode = 'calc' | 'sum';
  const [mode, setMode] = useState<Mode>('calc');

  // State for 'calc' mode
  const [currentOperand, setCurrentOperand] = useState<string>('40');
  const [calcHistory, setCalcHistory] = useState<CalculationResult[]>([]);

  // State for 'sum' mode
  const [sumTotal, setSumTotal] = useState<number>(0);
  const [currentSumInput, setCurrentSumInput] = useState<string>('0');
  const [sumHistory, setSumHistory] = useState<string[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (mode === 'sum' && historyRef.current) {
      historyRef.current.scrollLeft = historyRef.current.scrollWidth;
    }
  }, [sumHistory, mode]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const toggleMode = () => {
    setMode(prev => (prev === 'calc' ? 'sum' : 'calc'));
    // Reset states when switching modes for a clean slate
    setCurrentOperand('40');
    setSumTotal(0);
    setCurrentSumInput('0');
    setSumHistory([]);
    setCalcHistory([]);
  };

  const displayValue = useMemo(() => {
    if (mode === 'calc') {
      return currentOperand || '0';
    }
    return sumTotal.toString();
  }, [mode, currentOperand, sumTotal]);

  const results = useMemo((): CalculationResult => {
    const numValue = parseFloat(displayValue) || 0;
    
    if (mode === 'sum') {
      // In sum mode, vtValue is a direct copy of the sum total
      const vtValue = numValue;
      const finalValue = vtValue * multiplier;
      return { inputValue: numValue, vtValue, multiplier, finalValue };
    }

    // Default 'calc' mode logic
    const vtValue = (numValue / 4) + 1;
    const finalValue = vtValue * multiplier;
    return { inputValue: numValue, vtValue, multiplier, finalValue };
  }, [displayValue, multiplier, mode]);

  // --- Handlers for 'calc' mode ---
  const clearCalc = () => {
    setCurrentOperand('0');
  };
  const deleteDigitCalc = () => {
    if (currentOperand.length <= 1) {
      setCurrentOperand('0');
      return;
    }
    setCurrentOperand(currentOperand.slice(0, -1));
  };
  const appendDigitCalc = (digit: string) => {
    if (digit === '.' && currentOperand.includes('.')) return;
    if (currentOperand === '0' && digit !== '.') {
      setCurrentOperand(digit);
    } else {
      setCurrentOperand(currentOperand + digit);
    }
  };
  const handleSaveToHistory = () => {
    if (!results || results.inputValue === 0) return;
    setCalcHistory(prev => [results, ...prev]);
    setCurrentOperand('0');
  };
  const clearCalcHistory = () => {
    setCalcHistory([]);
  };


  // --- Handlers for 'sum' mode ---
  const clearSum = () => {
    setSumTotal(0);
    setCurrentSumInput('0');
    setSumHistory([]);
  };
  const deleteDigitSum = () => setCurrentSumInput(prev => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  const appendDigitSum = (digit: string) => {
    if (digit === '.' && currentSumInput.includes('.')) return;
    if (currentSumInput === '0' && digit !== '.') setCurrentSumInput(digit);
    else setCurrentSumInput(currentSumInput + digit);
  };
  const performSumOperation = (op: '+' | '-') => {
    const value = parseFloat(currentSumInput) || 0;
    if (value === 0) return;
    const historyEntry = sumHistory.length === 0 ? `${value}` : `${op} ${value}`;
    setSumHistory(prev => [...prev, historyEntry]);

    if (op === '+') setSumTotal(prev => prev + value);
    if (op === '-') setSumTotal(prev => prev - value);
    setCurrentSumInput('0');
  };
  
  const KeyButton = ({ children, onClick, className = "", variant = "default" }: any) => {
    const baseClasses = "flex items-center justify-center text-lg font-bold rounded-xl transition-all duration-200 active:scale-95 py-3 select-none";
    const variants: Record<string, string> = { default: "bg-slate-200/50 dark:bg-slate-800/60 hover:bg-slate-300/70 dark:hover:bg-slate-700/70 text-slate-800 dark:text-slate-200 border border-slate-300/50 dark:border-slate-700/30", action: "bg-blue-500/10 dark:bg-blue-600/10 hover:bg-blue-500/20 dark:hover:bg-blue-600/30 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/20", danger: "bg-rose-500/10 dark:bg-rose-600/10 hover:bg-rose-500/20 dark:hover:bg-rose-600/30 text-rose-500 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/20" };
    return (<button onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`}>{children}</button>);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-x-hidden relative">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button onClick={toggleMode} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 bg-slate-200/70 dark:bg-slate-800/70 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 shadow-md" aria-label="Toggle mode">
          <i className={`fa-solid ${mode === 'calc' ? 'fa-plus-minus' : 'fa-calculator'}`}></i>
        </button>
        <button onClick={toggleTheme} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 bg-slate-200/70 dark:bg-slate-800/70 hover:text-yellow-500 dark:hover:text-yellow-400 transition-all duration-300 shadow-md" aria-label="Toggle theme">
          {theme === 'light' ? <i className="fa-solid fa-moon"></i> : <i className="fa-solid fa-sun"></i>}
        </button>
      </div>

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/20 dark:bg-blue-600/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/20 dark:bg-emerald-600/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <header className="mb-6 text-center">
        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-emerald-500 to-teal-500 dark:from-blue-400 dark:via-emerald-400 dark:to-teal-400 tracking-tight">VT CALC</h1>
        <p className="text-slate-500 text-[10px] font-medium tracking-[0.3em] uppercase opacity-80">{mode === 'calc' ? 'conversor' : 'Modo de Soma'}</p>
      </header>

      <main className="w-full max-w-sm space-y-4">
        <div className="glass rounded-[2rem] p-5 shadow-2xl dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4),_0_8px_10px_-6px_rgba(0,0,0,0.4)]">
          <div className="bg-slate-200/60 dark:bg-slate-900/60 rounded-2xl p-4 mb-4 border border-slate-300/50 dark:border-slate-800 flex flex-col items-end gap-0.5 shadow-inner min-h-[80px] justify-end">
            <div className="text-lg text-slate-500 font-mono self-end break-all h-6">
              {mode === 'sum' && (currentSumInput !== '0' ? currentSumInput : '')}
            </div>
            <div className="text-4xl font-mono font-bold tracking-tighter text-slate-900 dark:text-white overflow-hidden whitespace-nowrap break-all">{displayValue}</div>
          </div>
          
          {mode === 'sum' && sumHistory.length > 0 && (
            <div ref={historyRef} className="bg-slate-200/50 dark:bg-slate-900/40 p-2 rounded-xl mb-4 text-left text-xs text-slate-500 font-mono overflow-x-auto whitespace-nowrap">
              {sumHistory.join(' ')}
            </div>
          )}

          {mode === 'calc' && (
            <div className="bg-slate-200/50 dark:bg-slate-900/40 p-2 rounded-xl mb-4">
              <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Histórico</h3>
                {calcHistory.length > 0 && (
                  <button onClick={clearCalcHistory} className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 text-[10px] font-bold transition px-2 py-1 rounded">
                    Limpar
                  </button>
                )}
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                {calcHistory.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-4">Nenhum cálculo salvo.</p>
                ) : (
                  calcHistory.map((item, index) => (
                    <div key={index} className="bg-slate-100/50 dark:bg-slate-800/40 rounded-lg p-2 text-xs flex flex-col gap-1">
                      <div className="flex justify-between items-baseline font-mono">
                        <span className="text-slate-500">Entrada: <span className="font-bold text-slate-700 dark:text-slate-300">{item.inputValue.toLocaleString()}</span></span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.finalValue.toFixed(2)} VT+</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        <span>{item.vtValue.toFixed(2)}vt &bull; {item.multiplier.toFixed(1)}x</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className={`grid ${mode === 'calc' ? 'grid-cols-3' : 'grid-cols-4'} gap-2 mb-4`}>
            {mode === 'calc' ? (
              <>
                {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map(n => <KeyButton key={n} onClick={() => appendDigitCalc(n)}>{n}</KeyButton>)}
                <KeyButton onClick={() => appendDigitCalc('.')}>.</KeyButton>
                <KeyButton onClick={() => appendDigitCalc('0')}>0</KeyButton>
                <KeyButton onClick={deleteDigitCalc} variant="action"><i className="fa-solid fa-delete-left"></i></KeyButton>
                <KeyButton onClick={clearCalc} variant="danger" className="col-span-2">C</KeyButton>
                <KeyButton onClick={handleSaveToHistory} variant="action"><i className="fa-solid fa-floppy-disk"></i></KeyButton>
              </>
            ) : (
              <>
                <KeyButton onClick={clearSum} variant="danger" className="col-span-2">AC</KeyButton>
                <KeyButton onClick={deleteDigitSum} variant="action" className="col-span-2"><i className="fa-solid fa-delete-left text-xl"></i></KeyButton>
                {['7', '8', '9'].map(n => <KeyButton key={n} onClick={() => appendDigitSum(n)}>{n}</KeyButton>)}
                <KeyButton onClick={() => performSumOperation('+')} variant="action" className="text-2xl row-span-2 !py-0">+</KeyButton>
                {['4', '5', '6'].map(n => <KeyButton key={n} onClick={() => appendDigitSum(n)}>{n}</KeyButton>)}
                {['1', '2', '3'].map(n => <KeyButton key={n} onClick={() => appendDigitSum(n)}>{n}</KeyButton>)}
                <KeyButton onClick={() => performSumOperation('-')} variant="action" className="text-2xl row-span-2 !py-0">-</KeyButton>
                <KeyButton onClick={() => appendDigitSum('0')} className="col-span-2">0</KeyButton>
                <KeyButton onClick={() => appendDigitSum('.')}>.</KeyButton>
              </>
            )}
          </div>

          <div className="space-y-2.5 bg-slate-200/50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-300/50 dark:border-slate-800/50">
            <div className="flex justify-between items-center px-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">compra</label>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">{multiplier.toFixed(1)}x</span>
            </div>
            <input type="range" min="0.1" max="10" step="0.1" value={multiplier} onChange={(e) => setMultiplier(parseFloat(e.target.value))} className="w-full accent-emerald-500 h-1 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4 border-blue-500/10 flex flex-col justify-center">
            <span className="text-[9px] font-bold text-blue-600/60 dark:text-blue-400/60 uppercase mb-1">Moeda VT</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold mono text-slate-900 dark:text-white">{results.vtValue.toFixed(2)}</span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">vt</span>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 border-emerald-500/10 bg-emerald-500/5 flex flex-col justify-center">
            <span className="text-[9px] font-bold text-emerald-600/60 dark:text-emerald-400/60 uppercase mb-1">Final</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold mono text-emerald-600 dark:text-emerald-400">{results.finalValue.toFixed(2)}</span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500">VT+</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-8 text-center text-slate-400 dark:text-slate-800 text-[8px] font-bold uppercase tracking-[0.3em]">VT Digital Systems &bull; Session Secured</footer>
    </div>
  );
};

export default App;
