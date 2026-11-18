export const isGtaTheme = Date.now() < new Date(2026, 10, 25, 0, 0, 0).getTime();

export const theme = isGtaTheme
  ? {
      name: "VICE CITY",
      tagline: "GTA VI COUNTDOWN EDITION",
      spotlightTitle: "Grand Theft Auto VI",
      spotlightKicker: "THE VICE CITY COUNTDOWN",
      spotlightSub: "Neon nights. Palm-lined streets. The next chapter.",
      heroImage: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1200",
      colors: { bg:"#080D16", panel:"#111B29", panel2:"#172638", line:"#294052", text:"#F4FAFF", muted:"#8FA7B5", purple:"#F06A9B", lav:"#FF9FC0", green:"#5DE0C0", orange:"#FFC17A", cyan:"#69E6E0", red:"#FF778B" }
    }
  : {
      name: "WINTER MODE",
      tagline: "RESPAWN FESTIVE EDITION",
      spotlightTitle: "Winter gaming season",
      spotlightKicker: "THE HOLIDAY DROP",
      spotlightSub: "Cosy sessions, festive quests and end-of-year wins.",
      heroImage: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200",
      colors: { bg:"#09130F", panel:"#12221B", panel2:"#1A3025", line:"#2B4A39", text:"#F7FFF9", muted:"#9BB5A5", purple:"#B82E42", lav:"#F2C66D", green:"#4FD18A", orange:"#E8A85C", cyan:"#8BDCC0", red:"#F06B73" }
    };
