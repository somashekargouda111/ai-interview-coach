import { useEffect, useRef, useState } from 'react';
import { btnGhost } from './ui';

interface Props {
  value: string;
  onChange: (text: string) => void;
  onUsed: () => void;
  disabled?: boolean;
  lang?: string;
}

// Browser Web Speech API (Chrome/Edge/Safari). Audio is processed by the browser vendor's service.
const Recognition: any = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

export default function VoiceRecorder({ value, onChange, onUsed, disabled, lang = 'en-US' }: Props) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const recRef = useRef<any>(null);
  const baseRef = useRef('');
  const finalRef = useRef('');

  useEffect(() => () => recRef.current?.abort(), []);

  if (!Recognition) {
    return <p className="text-sm text-muted">Voice answers need Chrome, Edge or Safari. You can still type your answer.</p>;
  }

  const start = () => {
    setError('');
    baseRef.current = value.trim();
    finalRef.current = '';
    const rec = new Recognition();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalRef.current += `${r[0].transcript} `;
        else interim += r[0].transcript;
      }
      onChange([baseRef.current, finalRef.current + interim].filter(Boolean).join(' ').trim());
    };
    rec.onerror = (e: any) => {
      setError(
        e.error === 'not-allowed'
          ? 'Microphone access was blocked. Allow it in your browser settings and try again.'
          : e.error === 'no-speech'
            ? 'No speech detected. Try again.'
            : 'Voice input stopped unexpectedly.',
      );
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    onUsed();
    setListening(true);
  };

  const stop = () => recRef.current?.stop();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className={btnGhost} onClick={listening ? stop : start} disabled={disabled} aria-pressed={listening}>
        <span className={`h-2.5 w-2.5 rounded-full ${listening ? 'animate-pulse bg-flag' : 'bg-muted'}`} />
        {listening ? 'Stop recording' : 'Answer by voice'}
      </button>
      {listening && <span className="text-sm text-muted">Listening… edit the transcript before you submit.</span>}
      {error && <span role="alert" className="text-sm text-flag">{error}</span>}
    </div>
  );
}
