// src/types/global.d.ts
export {};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    onYouTubeIframeAPIReady?: () => void;
    YT?: {
      Player: new (elementId: string, options: any) => any;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
  }
}

// global.d.ts or tweet.d.ts in your project
declare global {
  interface Window {
    twttr: any; // or use proper types if available
  }
}
