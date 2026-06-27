window.ThemeConfig = {
  classes: {
    crt: "crt-enabled",
    fog: "fog-enabled",
    animations: "animations-enabled"
  },
  defaults: {
    crt: true,
    fog: true,
    animations: true,
    fontSize: 100,
    language: "en"
  }
};

window.ThemeManager = (() => {
  function apply(settings = {}) {
    const merged = { ...window.ThemeConfig.defaults, ...settings };
    document.body.classList.toggle("reduce-motion", !merged.animations || Boolean(merged.reducedMotion));
    document.body.classList.toggle("animations-enabled", Boolean(merged.animations) && !merged.reducedMotion);
    document.body.classList.toggle("crt-disabled", !merged.crt);
    document.body.classList.toggle("fog-disabled", !merged.fog);
    document.documentElement.style.setProperty("--font-scale", `${merged.fontSize || 100}%`);
  }

  return { apply };
})();
