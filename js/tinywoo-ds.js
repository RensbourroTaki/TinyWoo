/* @ds-bundle: {"format":4,"namespace":"TinyWooDesignSystem_fe221f","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"CrosshairGame","sourcePath":"components/game/CrosshairGame.jsx"},{"name":"GameCard","sourcePath":"components/layout/GameCard.jsx"},{"name":"SlantSection","sourcePath":"components/layout/SlantSection.jsx"},{"name":"DEMO_TRACKS","sourcePath":"components/media/MusicPlayer.jsx"},{"name":"MusicPlayer","sourcePath":"components/media/MusicPlayer.jsx"},{"name":"NavBar","sourcePath":"components/navigation/NavBar.jsx"},{"name":"DEFAULT_SOCIALS","sourcePath":"components/navigation/SocialLinks.jsx"},{"name":"SocialLinks","sourcePath":"components/navigation/SocialLinks.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"1b76b5085db1","components/core/Button.jsx":"a840ee0cb16e","components/core/Icon.jsx":"c95ebca589b8","components/core/IconButton.jsx":"bd086e80ec57","components/feedback/Dialog.jsx":"8237065484a9","components/feedback/Toast.jsx":"13823877d66d","components/forms/Input.jsx":"b751456fde32","components/forms/Switch.jsx":"e325cde7b681","components/game/CrosshairGame.jsx":"c6051fa16492","components/layout/GameCard.jsx":"9d0dd62eb84e","components/layout/SlantSection.jsx":"cf8c7a495f0b","components/media/MusicPlayer.jsx":"13300982cd02","components/navigation/NavBar.jsx":"893443aba4ab","components/navigation/SocialLinks.jsx":"e0c41e831afa","ui_kits/website/Hero.jsx":"ff5946479c1d","ui_kits/website/Sections.jsx":"d138f29e994c"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.TinyWooDesignSystem_fe221f = window.TinyWooDesignSystem_fe221f || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
const TONES = {
  sun: ['var(--sun-400)', 'var(--ink)'],
  orange: ['var(--orange-500)', 'var(--ink)'],
  lime: ['var(--lime-400)', 'var(--ink)'],
  sky: ['var(--sky-400)', 'var(--ink)'],
  cherry: ['var(--cherry-400)', 'var(--gray-50)'],
  blue: ['var(--blue-600)', 'var(--gray-50)'],
  outline: ['transparent', 'var(--gray-100)']
};
function Badge({
  tone = 'sun',
  tilt = false,
  icon,
  children,
  style
}) {
  const [bg, fg] = TONES[tone] || TONES.sun;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 26,
      padding: '0 11px',
      boxSizing: 'border-box',
      borderRadius: 'var(--radius-pill)',
      border: `2px solid ${tone === 'outline' ? 'var(--border-strong)' : 'var(--ink)'}`,
      background: bg,
      color: fg,
      fontFamily: 'var(--font-pixel)',
      fontSize: 12,
      letterSpacing: 'var(--tracking-pixel)',
      textTransform: 'uppercase',
      lineHeight: 1,
      whiteSpace: 'nowrap',
      boxShadow: tone === 'outline' ? 'none' : 'var(--shadow-pop-sm)',
      transform: tilt ? 'rotate(-4deg)' : undefined,
      ...style
    }
  }, icon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    h: 38,
    px: 18,
    fs: 16,
    gap: 6,
    bw: 3
  },
  md: {
    h: 50,
    px: 26,
    fs: 21,
    gap: 8,
    bw: 3
  },
  lg: {
    h: 66,
    px: 36,
    fs: 30,
    gap: 10,
    bw: 4
  }
};
const VARIANTS = {
  primary: {
    bg: 'var(--grad-sun)',
    hover: 'var(--grad-sun-hot)',
    color: 'var(--ink)'
  },
  secondary: {
    bg: 'var(--electric-500)',
    hover: 'var(--electric-400)',
    color: 'var(--gray-50)'
  },
  lime: {
    bg: 'var(--lime-400)',
    hover: '#9AF26C',
    color: 'var(--ink)'
  },
  sky: {
    bg: 'var(--sky-400)',
    hover: '#82D7FA',
    color: 'var(--ink)'
  },
  danger: {
    bg: 'var(--cherry-400)',
    hover: '#FF7385',
    color: 'var(--gray-50)'
  },
  ghost: {
    bg: 'rgba(255,255,255,.06)',
    hover: 'rgba(255,255,255,.14)',
    color: 'var(--gray-100)',
    ghost: true
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled,
  href,
  onClick,
  children,
  fullWidth,
  tilt = true,
  type = 'button',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;
  const lift = disabled ? 0 : press ? 4 : hover ? -2 : 0;
  const shadowY = v.ghost ? 0 : Math.max(0, (size === 'lg' ? 7 : 5) - (press ? 4 : 0) + (hover && !press ? 1 : 0));
  const Tag = href ? 'a' : 'button';
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    type: href ? undefined : type,
    disabled: disabled,
    onClick: disabled ? undefined : onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: fullWidth ? 'flex' : 'inline-flex',
      width: fullWidth ? '100%' : undefined,
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      height: s.h,
      padding: `0 ${s.px}px`,
      boxSizing: 'border-box',
      borderRadius: 'var(--radius-pill)',
      border: `${s.bw}px solid ${v.ghost ? 'var(--border-strong)' : 'var(--ink)'}`,
      background: hover && !disabled ? v.hover : v.bg,
      color: v.color,
      boxShadow: v.ghost ? 'none' : `0 ${shadowY}px 0 var(--ink), var(--shadow-inset)`,
      fontFamily: 'var(--font-display)',
      fontSize: s.fs,
      lineHeight: 1,
      letterSpacing: '.02em',
      textTransform: 'uppercase',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transform: `translateY(${lift}px) rotate(${tilt && hover && !press && !disabled ? -2 : 0}deg) scale(${hover && !press && !disabled ? 1.04 : 1})`,
      transition: 'transform var(--dur) var(--ease-pop), box-shadow var(--dur-fast) var(--ease-snap), background var(--dur-fast)',
      ...style
    }
  }, rest), icon, children != null && /*#__PURE__*/React.createElement("span", {
    style: {
      transform: 'translateY(1px)'
    }
  }, children), iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
const LUCIDE = 'https://cdn.jsdelivr.net/npm/lucide-static@0.469.0/icons/';
const BRANDS = 'https://cdn.jsdelivr.net/npm/simple-icons@13/icons/';
const cache = {};
function load(url) {
  if (!cache[url]) cache[url] = fetch(url).then(r => r.ok ? r.text() : '').catch(() => '');
  return cache[url];
}
function Icon({
  name,
  brand = false,
  size = 20,
  color = 'currentColor',
  style,
  title
}) {
  const url = (brand ? BRANDS : LUCIDE) + name + '.svg';
  const [svg, setSvg] = React.useState(() => typeof cache[url] === 'string' ? cache[url] : '');
  React.useEffect(() => {
    let live = true;
    load(url).then(t => {
      const clean = t.replace(/<svg([^>]*)>/, (m, a) => '<svg' + a.replace(/\s(width|height|class)="[^"]*"/g, '') + ' width="100%" height="100%"' + (brand ? ' fill="currentColor"' : '') + '>');
      if (live) setSvg(clean);
    });
    return () => {
      live = false;
    };
  }, [url]);
  return /*#__PURE__*/React.createElement("span", {
    role: title ? 'img' : undefined,
    "aria-label": title,
    "aria-hidden": title ? undefined : true,
    dangerouslySetInnerHTML: {
      __html: svg
    },
    style: {
      display: 'inline-flex',
      width: size,
      height: size,
      flexShrink: 0,
      color,
      lineHeight: 0,
      ...style
    }
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
const TONES = {
  sun: {
    bg: 'var(--grad-sun)',
    color: 'var(--ink)'
  },
  blue: {
    bg: 'var(--blue-600)',
    color: 'var(--gray-50)'
  },
  electric: {
    bg: 'var(--electric-500)',
    color: 'var(--gray-50)'
  },
  dark: {
    bg: 'var(--blue-950)',
    color: 'var(--gray-100)'
  }
};
function IconButton({
  icon,
  label,
  tone = 'blue',
  size = 44,
  active,
  onClick,
  href,
  disabled,
  style
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const t = active ? TONES.sun : TONES[tone] || TONES.blue;
  const Tag = href ? 'a' : 'button';
  const drop = press ? 0 : 4;
  return /*#__PURE__*/React.createElement(Tag, {
    href: href,
    "aria-label": label,
    title: label,
    disabled: disabled,
    onClick: disabled ? undefined : onClick,
    type: href ? undefined : 'button',
    target: href ? '_blank' : undefined,
    rel: href ? 'noopener noreferrer' : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      width: size,
      height: size,
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      borderRadius: Math.round(size * 0.34),
      border: '3px solid var(--ink)',
      background: t.bg,
      color: t.color,
      boxShadow: `0 ${drop}px 0 var(--ink)`,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      padding: 0,
      filter: hover && !disabled ? 'brightness(1.12)' : 'none',
      transform: `translateY(${press ? 4 : hover ? -2 : 0}px) rotate(${hover && !press ? -6 : 0}deg)`,
      transition: 'transform var(--dur) var(--ease-pop), box-shadow var(--dur-fast), filter var(--dur-fast)',
      ...style
    }
  }, icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  width = 440,
  style
}) {
  React.useEffect(() => {
    if (!open) return;
    const k = e => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      background: 'rgba(6,18,51,.62)',
      backdropFilter: 'var(--blur-glass)',
      WebkitBackdropFilter: 'var(--blur-glass)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    onClick: e => e.stopPropagation(),
    style: {
      width: '100%',
      maxWidth: width,
      boxSizing: 'border-box',
      background: 'var(--blue-800)',
      border: '4px solid var(--ink)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-pop-lg), var(--shadow-float)',
      padding: '26px 28px 24px',
      animation: 'tw-pop-in var(--dur-slow) var(--ease-pop)',
      color: 'var(--text-body)',
      ...style
    }
  }, title && /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 14px',
      fontFamily: 'var(--font-display)',
      fontSize: 38,
      lineHeight: 1,
      color: 'var(--sun-400)',
      WebkitTextStroke: '3px var(--ink)',
      paintOrder: 'stroke fill',
      textShadow: '0 4px 0 var(--ink)',
      transform: 'rotate(-2deg)',
      transformOrigin: 'left'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      lineHeight: 1.55
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
      marginTop: 22
    }
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const TONES = {
  sun: 'var(--grad-sun)',
  lime: 'var(--lime-400)',
  cherry: 'var(--cherry-400)',
  sky: 'var(--sky-400)'
};
function Toast({
  tone = 'sun',
  icon,
  title,
  children,
  onClose,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px 12px 14px',
      maxWidth: 380,
      boxSizing: 'border-box',
      background: TONES[tone] || TONES.sun,
      color: tone === 'cherry' ? 'var(--gray-50)' : 'var(--ink)',
      border: '3px solid var(--ink)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-pop)',
      transform: 'rotate(-2deg)',
      animation: 'tw-toast-in var(--dur-slow) var(--ease-pop)',
      ...style
    }
  }, icon, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 20,
      lineHeight: 1.05
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      lineHeight: 1.35,
      fontWeight: 500
    }
  }, children)), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Dismiss",
    style: {
      background: 'none',
      border: 0,
      cursor: 'pointer',
      fontFamily: 'var(--font-pixel)',
      fontSize: 16,
      color: 'inherit',
      padding: 4
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function Input({
  label,
  value,
  defaultValue,
  onChange,
  placeholder,
  pixel = false,
  maxLength,
  type = 'text',
  disabled,
  error,
  icon,
  autoFocus,
  onKeyDown,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  const border = error ? 'var(--cherry-400)' : focus ? 'var(--sun-400)' : 'var(--ink)';
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-pixel)',
      fontSize: 12,
      letterSpacing: 'var(--tracking-pixel)',
      textTransform: 'uppercase',
      color: 'var(--gray-300)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 50,
      padding: '0 18px',
      boxSizing: 'border-box',
      borderRadius: 'var(--radius-pill)',
      border: `3px solid ${border}`,
      background: 'var(--blue-950)',
      boxShadow: focus ? 'var(--glow-sun), inset 0 3px 0 rgba(0,0,0,.35)' : 'inset 0 3px 0 rgba(0,0,0,.35)',
      transition: 'box-shadow var(--dur), border-color var(--dur-fast)',
      opacity: disabled ? 0.5 : 1,
      color: 'var(--gray-300)'
    }
  }, icon, /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    maxLength: maxLength,
    disabled: disabled,
    autoFocus: autoFocus,
    onChange: onChange,
    onKeyDown: onKeyDown,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      background: 'transparent',
      border: 0,
      outline: 'none',
      color: 'var(--gray-50)',
      fontFamily: pixel ? 'var(--font-pixel)' : 'var(--font-body)',
      fontSize: pixel ? 20 : 16,
      letterSpacing: pixel ? 'var(--tracking-pixel)' : 0,
      textTransform: pixel ? 'uppercase' : 'none'
    }
  })), error && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--cherry-400)'
    }
  }, error));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function Switch({
  checked,
  defaultChecked = false,
  onChange,
  label,
  disabled,
  style
}) {
  const [inner, setInner] = React.useState(defaultChecked);
  const on = checked ?? inner;
  const toggle = () => {
    if (disabled) return;
    const n = !on;
    if (checked === undefined) setInner(n);
    onChange && onChange(n);
  };
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": on,
    onClick: toggle,
    disabled: disabled,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      background: 'none',
      border: 0,
      padding: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      width: 58,
      height: 32,
      borderRadius: 'var(--radius-pill)',
      border: '3px solid var(--ink)',
      boxSizing: 'border-box',
      background: on ? 'var(--lime-400)' : 'var(--blue-950)',
      boxShadow: 'inset 0 3px 0 rgba(0,0,0,.25)',
      transition: 'background var(--dur)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: on ? 28 : 2,
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: 'var(--gray-50)',
      border: '2px solid var(--ink)',
      boxSizing: 'border-box',
      boxShadow: '0 2px 0 var(--ink)',
      transition: 'left var(--dur) var(--ease-pop)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-pixel)',
      fontSize: 14,
      letterSpacing: 'var(--tracking-pixel)',
      textTransform: 'uppercase',
      color: 'var(--gray-100)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/game/CrosshairGame.jsx
try { (() => {
const SIZES = [{
  s: 38,
  pts: 50,
  v: 1.5
}, {
  s: 58,
  pts: 25,
  v: 1.1
}, {
  s: 88,
  pts: 10,
  v: 0.75
}];
const pixel = (fs, color) => ({
  fontFamily: 'var(--font-pixel)',
  fontSize: fs,
  letterSpacing: 'var(--tracking-pixel)',
  textTransform: 'uppercase',
  color,
  lineHeight: 1
});
const loadScores = k => {
  try {
    return JSON.parse(localStorage.getItem(k) || '[]');
  } catch (e) {
    return [];
  }
};
function Target({
  t,
  sprite
}) {
  const flip = t.vx < 0 ? -1 : 1;
  const base = {
    position: 'absolute',
    left: t.x - t.s / 2,
    top: t.y - t.s / 2,
    width: t.s,
    height: t.s,
    pointerEvents: 'none'
  };
  if (sprite) {
    const frames = Array.isArray(sprite.src) ? sprite.src.length : sprite.frames || 2;
    const f = Math.floor(t.age * (sprite.fps || 8)) % frames;
    const img = Array.isArray(sprite.src) ? {
      backgroundImage: `url(${sprite.src[f]})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center'
    } : {
      backgroundImage: `url(${sprite.src})`,
      backgroundSize: `${frames * 100}% 100%`,
      backgroundPosition: `${frames > 1 ? f / (frames - 1) * 100 : 0}% 0`
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        ...base,
        ...img,
        backgroundRepeat: 'no-repeat',
        transform: `scaleX(${flip * (sprite.facing === 'left' ? -1 : 1)})`,
        imageRendering: sprite.pixelated ? 'pixelated' : undefined
      }
    });
  }
  const wob = Math.sin(t.age * 10) * 8;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...base,
      borderRadius: '50%',
      border: '3px solid var(--ink)',
      boxSizing: 'border-box',
      boxShadow: '0 4px 0 var(--ink)',
      transform: `rotate(${wob}deg)`,
      background: 'radial-gradient(circle,var(--cherry-400) 0 16%,var(--gray-50) 17% 34%,var(--orange-500) 35% 52%,var(--gray-50) 53% 70%,var(--sun-400) 71%)'
    }
  });
}
function CrosshairGame({
  duration = 45,
  ammo = 8,
  sprite,
  background,
  height = 520,
  storageKey = 'tw-crosshair-scores',
  title = 'Woo Hunt',
  onGameOver,
  style
}) {
  const [phase, setPhase] = React.useState('start');
  const [, tick] = React.useState(0);
  const [scores, setScores] = React.useState(() => loadScores(storageKey));
  const [name, setName] = React.useState('');
  const [lastRank, setLastRank] = React.useState(-1);
  const stage = React.useRef(null),
    cross = React.useRef(null);
  const g = React.useRef(null);
  const reset = () => {
    g.current = {
      targets: [],
      pops: [],
      score: 0,
      hits: 0,
      shots: 0,
      ammo,
      time: duration,
      spawn: 0,
      id: 0,
      flash: 0,
      reloadMsg: 0
    };
  };
  if (!g.current) reset();
  const start = () => {
    reset();
    setName('');
    setLastRank(-1);
    setPhase('play');
  };
  const reload = () => {
    if (phase === 'play') {
      g.current.ammo = ammo;
      g.current.reloadMsg = 0;
      tick(n => n + 1);
    }
  };
  React.useEffect(() => {
    if (phase !== 'play') return;
    let raf,
      last = performance.now();
    const W = () => stage.current ? stage.current.clientWidth : 800;
    const loop = now => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = g.current;
      s.time -= dt;
      s.spawn -= dt;
      s.flash = Math.max(0, s.flash - dt);
      if (s.spawn <= 0 && s.targets.length < 7) {
        const sz = SIZES[Math.floor(Math.random() * 3)],
          left = Math.random() < 0.5,
          w = W();
        s.targets.push({
          id: ++s.id,
          s: sz.s,
          pts: sz.pts,
          x: left ? -sz.s : w + sz.s,
          by: height * (0.14 + Math.random() * 0.5),
          y: 0,
          vx: (left ? 1 : -1) * (110 + Math.random() * 120) * sz.v,
          amp: 12 + Math.random() * 30,
          fq: 1.5 + Math.random() * 2.5,
          age: 0
        });
        s.spawn = 0.45 + Math.random() * 0.7;
      }
      const w = W();
      s.targets.forEach(t => {
        t.age += dt;
        t.x += t.vx * dt;
        t.y = t.by + Math.sin(t.age * t.fq) * t.amp;
      });
      s.targets = s.targets.filter(t => t.x > -120 && t.x < w + 120);
      s.pops.forEach(p => {
        p.age += dt;
      });
      s.pops = s.pops.filter(p => p.age < 0.8);
      if (s.time <= 0) {
        s.time = 0;
        setPhase('over');
        onGameOver && onGameOver(s.score);
        return;
      }
      tick(n => n + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const key = e => {
      if (e.key === 'r' || e.key === 'R' || e.code === 'Space') {
        e.preventDefault();
        g.current.ammo = ammo;
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', key);
    };
  }, [phase]);
  const move = e => {
    const r = stage.current.getBoundingClientRect();
    if (cross.current) cross.current.style.transform = `translate(${e.clientX - r.left}px,${e.clientY - r.top}px)`;
  };
  const shoot = e => {
    if (phase !== 'play') return;
    if (e.button === 2) return;
    const s = g.current,
      r = stage.current.getBoundingClientRect(),
      x = e.clientX - r.left,
      y = e.clientY - r.top;
    if (s.ammo <= 0) {
      s.reloadMsg = 1;
      return;
    }
    s.ammo--;
    s.shots++;
    s.flash = 0.08;
    for (let k = s.targets.length - 1; k >= 0; k--) {
      const t = s.targets[k];
      if (Math.hypot(t.x - x, t.y - y) <= t.s / 2 + 4) {
        s.targets.splice(k, 1);
        s.score += t.pts;
        s.hits++;
        s.pops.push({
          id: t.id,
          x: t.x,
          y: t.y,
          txt: '+' + t.pts,
          age: 0
        });
        break;
      }
    }
  };
  const save = () => {
    const s = g.current,
      entry = {
        name: (name || 'AAA').toUpperCase().slice(0, 10),
        score: s.score,
        date: Date.now()
      };
    const list = [...scores, entry].sort((a, b) => b.score - a.score).slice(0, 10);
    setScores(list);
    setLastRank(list.indexOf(entry));
    try {
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch (e) {}
    setPhase('scores');
  };
  const s = g.current;
  const best = scores[0]?.score || 0;
  const overlay = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    background: 'rgba(6,18,51,.55)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    cursor: 'default'
  };
  const panel = {
    width: '100%',
    maxWidth: 420,
    background: 'var(--blue-800)',
    border: '4px solid var(--ink)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-pop-lg)',
    padding: 24,
    boxSizing: 'border-box',
    animation: 'tw-pop-in var(--dur-slow) var(--ease-pop)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    alignItems: 'stretch',
    textAlign: 'center'
  };
  const head = (txt, c = 'var(--sun-400)') => /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 46,
      lineHeight: 1,
      color: c,
      WebkitTextStroke: '3px var(--ink)',
      paintOrder: 'stroke fill',
      textShadow: '0 4px 0 var(--ink)',
      transform: 'rotate(-3deg)'
    }
  }, txt);
  return /*#__PURE__*/React.createElement("div", {
    ref: stage,
    onPointerMove: move,
    onPointerDown: shoot,
    onContextMenu: e => {
      e.preventDefault();
      reload();
    },
    style: {
      position: 'relative',
      height,
      overflow: 'hidden',
      borderRadius: 'var(--radius-xl)',
      border: '4px solid var(--ink)',
      boxShadow: 'var(--shadow-pop-lg)',
      userSelect: 'none',
      touchAction: 'none',
      cursor: phase === 'play' ? 'none' : 'default',
      background: background ? `center / cover no-repeat url(${background})` : 'linear-gradient(180deg,var(--sky-400) 0%,var(--electric-300) 55%,var(--blue-500) 56%,var(--blue-700) 100%)',
      ...style
    }
  }, !background && /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      position: 'absolute',
      left: '-5%',
      right: '-5%',
      bottom: -40,
      height: '42%',
      background: 'var(--blue-800)',
      transform: 'skewY(-4deg)',
      borderTop: '5px solid var(--sun-400)',
      backgroundImage: 'repeating-linear-gradient(-60deg,rgba(255,255,255,.04) 0 18px,transparent 18px 40px)'
    }
  }), s.flash > 0 && /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(255,240,160,.18)',
      pointerEvents: 'none'
    }
  }), s.targets.map(t => /*#__PURE__*/React.createElement(Target, {
    key: t.id,
    t: t,
    sprite: sprite
  })), s.pops.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      position: 'absolute',
      left: p.x,
      top: p.y - p.age * 60,
      transform: `translate(-50%,-50%) scale(${1 + p.age * 0.6}) rotate(-6deg)`,
      opacity: 1 - p.age / 0.8,
      pointerEvents: 'none',
      fontFamily: 'var(--font-display)',
      fontSize: 30,
      color: 'var(--sun-400)',
      WebkitTextStroke: '2px var(--ink)',
      paintOrder: 'stroke fill'
    }
  }, p.txt)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 14,
      left: 16,
      right: 16,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...pixel(36, 'var(--gray-50)'),
      textShadow: '0 3px 0 var(--ink)'
    }
  }, String(s.score).padStart(5, '0')), /*#__PURE__*/React.createElement("span", {
    style: pixel(12, 'var(--ink)')
  }, "Best ", best)), /*#__PURE__*/React.createElement("span", {
    style: {
      ...pixel(36, s.time < 10 ? 'var(--cherry-400)' : 'var(--sun-400)'),
      textShadow: '0 3px 0 var(--ink)'
    }
  }, Math.ceil(s.time), "s")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      right: 16,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: pixel(12, s.reloadMsg ? 'var(--cherry-400)' : 'var(--gray-200)')
  }, s.reloadMsg ? 'Reload! ' : '', "R / Space / Right-click = reload"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5
    }
  }, Array.from({
    length: ammo
  }).map((_, k) => /*#__PURE__*/React.createElement("span", {
    key: k,
    style: {
      width: 12,
      height: 30,
      borderRadius: '6px 6px 3px 3px',
      border: '2px solid var(--ink)',
      background: k < s.ammo ? 'var(--grad-sun)' : 'rgba(6,18,51,.4)',
      boxSizing: 'border-box'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    ref: cross,
    "aria-hidden": true,
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      pointerEvents: 'none',
      display: phase === 'play' ? 'block' : 'none',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: -24,
      top: -24,
      width: 48,
      height: 48,
      borderRadius: '50%',
      border: '3px solid var(--gray-50)',
      boxShadow: '0 0 0 2px var(--ink), inset 0 0 0 2px var(--ink)',
      boxSizing: 'border-box'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: -34,
      top: -1.5,
      width: 68,
      height: 3,
      background: 'var(--cherry-400)',
      boxShadow: '0 0 0 1.5px var(--ink)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: -1.5,
      top: -34,
      width: 3,
      height: 68,
      background: 'var(--cherry-400)',
      boxShadow: '0 0 0 1.5px var(--ink)'
    }
  })), phase === 'start' && /*#__PURE__*/React.createElement("div", {
    style: overlay,
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: panel
  }, head(title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--text-body)',
      fontSize: 15,
      lineHeight: 1.5
    }
  }, duration, " seconds. ", ammo, " shells. Small targets score more. Right-click to reload."), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "lg",
    onClick: start,
    icon: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "crosshair",
      size: 26
    })
  }, "Start"), scores.length > 0 && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "ghost",
    size: "sm",
    onClick: () => setPhase('scores')
  }, "Highscores"))), phase === 'over' && /*#__PURE__*/React.createElement("div", {
    style: overlay,
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: panel
  }, head("Time's up!", 'var(--orange-400)'), /*#__PURE__*/React.createElement("div", {
    style: pixel(44, 'var(--gray-50)')
  }, s.score), /*#__PURE__*/React.createElement("div", {
    style: pixel(12, 'var(--gray-300)')
  }, s.hits, " hits \xB7 ", s.shots ? Math.round(s.hits / s.shots * 100) : 0, "% accuracy"), /*#__PURE__*/React.createElement(__ds_scope.Input, {
    label: "Enter your name",
    pixel: true,
    maxLength: 10,
    placeholder: "AAA",
    value: name,
    autoFocus: true,
    onChange: e => setName(e.target.value),
    onKeyDown: e => e.key === 'Enter' && save()
  }), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    onClick: save,
    icon: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "trophy",
      size: 20
    })
  }, "Save score"))), phase === 'scores' && /*#__PURE__*/React.createElement("div", {
    style: overlay,
    onPointerDown: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    style: panel
  }, head('Highscore'), /*#__PURE__*/React.createElement("ol", {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, scores.map((r, k) => /*#__PURE__*/React.createElement("li", {
    key: k,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      height: 34,
      padding: '0 12px',
      borderRadius: 10,
      background: k === lastRank ? 'rgba(255,210,31,.18)' : k % 2 ? 'transparent' : 'rgba(255,255,255,.04)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...pixel(14, k < 3 ? 'var(--sun-400)' : 'var(--gray-400)'),
      width: 28,
      textAlign: 'left'
    }
  }, k + 1, "."), /*#__PURE__*/React.createElement("span", {
    style: {
      ...pixel(16, 'var(--gray-50)'),
      flex: 1,
      textAlign: 'left'
    }
  }, r.name), /*#__PURE__*/React.createElement("span", {
    style: pixel(16, k < 3 ? 'var(--sun-400)' : 'var(--gray-200)')
  }, r.score))), !scores.length && /*#__PURE__*/React.createElement("li", {
    style: pixel(13, 'var(--gray-300)')
  }, "No scores yet")), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    onClick: start,
    icon: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "rotate-ccw",
      size: 20
    })
  }, "Play again"))));
}
Object.assign(__ds_scope, { CrosshairGame });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/CrosshairGame.jsx", error: String((e && e.message) || e) }); }

// components/layout/GameCard.jsx
try { (() => {
function GameCard({
  title,
  image,
  tagline,
  tags = [],
  status,
  href,
  onClick,
  cta = 'Play',
  style
}) {
  const [hover, setHover] = React.useState(false);
  const Tag = href ? 'a' : 'div';
  return /*#__PURE__*/React.createElement(Tag, {
    href: href,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      flexDirection: 'column',
      textDecoration: 'none',
      color: 'inherit',
      cursor: href || onClick ? 'pointer' : 'default',
      background: 'var(--surface-card)',
      border: '4px solid var(--ink)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      boxShadow: hover ? '0 12px 0 var(--ink), var(--shadow-float)' : 'var(--shadow-pop-lg)',
      transform: hover ? 'translateY(-6px) rotate(-1.5deg)' : 'none',
      transition: 'transform var(--dur-slow) var(--ease-pop), box-shadow var(--dur)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      aspectRatio: '16 / 9',
      overflow: 'hidden',
      background: 'var(--blue-950)',
      clipPath: 'polygon(0 0,100% 0,100% 88%,0 100%)'
    }
  }, image && /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
      transform: hover ? 'scale(1.06)' : 'scale(1)',
      transition: 'transform var(--dur-slow) var(--ease-out)'
    }
  }), status && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 14,
      left: 14
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "lime",
    tilt: true
  }, status))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 22px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: 30,
      lineHeight: 1,
      color: 'var(--sun-400)',
      WebkitTextStroke: '2px var(--ink)',
      paintOrder: 'stroke fill',
      textShadow: '0 3px 0 var(--ink)'
    }
  }, title), tagline && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--text-body)',
      fontSize: 15,
      lineHeight: 1.5,
      textWrap: 'pretty'
    }
  }, tagline), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      flexWrap: 'wrap',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, tags.map(t => /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    key: t,
    tone: "outline"
  }, t))), cta && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 20,
      color: hover ? 'var(--orange-400)' : 'var(--gray-50)',
      transition: 'color var(--dur-fast)'
    }
  }, cta, " \u2192"))));
}
Object.assign(__ds_scope, { GameCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/GameCard.jsx", error: String((e && e.message) || e) }); }

// components/layout/SlantSection.jsx
try { (() => {
const TONES = {
  blue: 'var(--blue-700)',
  deep: 'var(--blue-900)',
  raised: 'var(--blue-600)',
  sun: 'var(--grad-sun)'
};
function SlantSection({
  tone = 'deep',
  angle = -4,
  stripes = true,
  edge = 'sun',
  id,
  children,
  style,
  innerStyle
}) {
  const edgeColor = edge === 'sun' ? 'var(--sun-400)' : edge === 'orange' ? 'var(--orange-500)' : edge === 'none' ? 'transparent' : 'var(--ink)';
  return /*#__PURE__*/React.createElement("section", {
    id: id,
    style: {
      position: 'relative',
      isolation: 'isolate',
      padding: 'var(--space-9) 0',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      position: 'absolute',
      inset: '0 -2%',
      zIndex: -1,
      transform: `skewY(${angle}deg)`,
      background: TONES[tone] || tone,
      borderTop: `5px solid ${edgeColor}`,
      borderBottom: '5px solid var(--ink)',
      backgroundImage: stripes ? 'repeating-linear-gradient(-60deg,rgba(255,255,255,.035) 0 18px,transparent 18px 40px)' : undefined
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container)',
      margin: '0 auto',
      padding: '0 var(--gutter)',
      ...innerStyle
    }
  }, children));
}
Object.assign(__ds_scope, { SlantSection });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/SlantSection.jsx", error: String((e && e.message) || e) }); }

// components/media/MusicPlayer.jsx
try { (() => {
const fmt = s => {
  s = Math.max(0, Math.floor(s || 0));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
};
const DEMO_TRACKS = [{
  title: 'Rocket Trump — Main Menu',
  artist: 'Tiny Woo',
  duration: 154
}, {
  title: 'Jungle Hangar',
  artist: 'Tiny Woo',
  duration: 201
}, {
  title: 'Tiger Gang Theme',
  artist: 'Tiny Woo',
  duration: 132
}, {
  title: 'Highscore Boogie',
  artist: 'Tiny Woo',
  duration: 178
}];
const pixel = (fs, color) => ({
  fontFamily: 'var(--font-pixel)',
  fontSize: fs,
  letterSpacing: 'var(--tracking-pixel)',
  textTransform: 'uppercase',
  color,
  lineHeight: 1
});
function Ctl({
  label,
  onClick,
  children,
  big,
  active
}) {
  const [p, setP] = React.useState(false);
  const sz = big ? 44 : 34;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": label,
    title: label,
    onClick: onClick,
    onMouseDown: () => setP(true),
    onMouseUp: () => setP(false),
    onMouseLeave: () => setP(false),
    style: {
      width: sz,
      height: sz,
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      cursor: 'pointer',
      borderRadius: big ? '50%' : 10,
      border: '3px solid var(--ink)',
      boxSizing: 'border-box',
      background: big || active ? 'var(--grad-sun)' : 'var(--blue-600)',
      color: big || active ? 'var(--ink)' : 'var(--gray-50)',
      boxShadow: p ? 'none' : '0 3px 0 var(--ink)',
      transform: p ? 'translateY(3px)' : 'none',
      transition: 'transform var(--dur-fast)'
    }
  }, children);
}
function MusicPlayer({
  tracks = DEMO_TRACKS,
  draggable = true,
  rail = true,
  defaultOpen = false,
  width = 380,
  storageKey = 'tw-player-x',
  defaultX = 1,
  style
}) {
  const [i, setI] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [t, setT] = React.useState(0);
  const [dur, setDur] = React.useState(tracks[0]?.duration || 0);
  const [vol, setVol] = React.useState(0.8);
  const [open, setOpen] = React.useState(defaultOpen);
  const [x, setX] = React.useState(() => {
    try {
      const v = parseFloat(localStorage.getItem(storageKey));
      return isNaN(v) ? defaultX : v;
    } catch (e) {
      return defaultX;
    }
  });
  const [dragging, setDragging] = React.useState(false);
  const audio = React.useRef(null),
    wrap = React.useRef(null),
    drag = React.useRef(null);
  const tr = tracks[i] || {};
  const go = React.useCallback(n => {
    setI((n + tracks.length) % tracks.length);
    setT(0);
  }, [tracks.length]);
  React.useEffect(() => {
    const a = audio.current;
    setDur(tr.duration || 0);
    if (!a) return;
    if (tr.src) {
      a.src = tr.src;
      a.load();
      if (playing) a.play().catch(() => {});
    } else {
      a.removeAttribute('src');
    }
  }, [i]);
  React.useEffect(() => {
    const a = audio.current;
    if (!a || !tr.src) return;
    playing ? a.play().catch(() => setPlaying(false)) : a.pause();
  }, [playing]);
  React.useEffect(() => {
    if (audio.current) audio.current.volume = vol;
  }, [vol]);
  React.useEffect(() => {
    if (!playing || tr.src) return;
    const id = setInterval(() => setT(v => {
      if (v + 0.25 >= (tr.duration || 0)) {
        go(i + 1);
        return 0;
      }
      return v + 0.25;
    }), 250);
    return () => clearInterval(id);
  }, [playing, i, tr.src]);
  const seek = v => {
    setT(v);
    if (audio.current && tr.src) audio.current.currentTime = v;
  };
  const onDown = e => {
    if (!draggable || e.button !== 0) return;
    const box = wrap.current.getBoundingClientRect();
    drag.current = {
      sx: e.clientX,
      sxv: x,
      range: Math.max(1, box.width - width)
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onMove = e => {
    const d = drag.current;
    if (!d) return;
    setX(Math.min(1, Math.max(0, d.sxv + (e.clientX - d.sx) / d.range)));
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    try {
      localStorage.setItem(storageKey, String(x));
    } catch (e) {}
  };
  const marquee = `${i + 1}. ${tr.artist ? tr.artist + ' — ' : ''}${tr.title || 'No track'}  ·  `;
  return /*#__PURE__*/React.createElement("div", {
    ref: wrap,
    style: {
      position: 'relative',
      width: '100%',
      ...style
    }
  }, rail && /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 21,
      height: 4,
      borderRadius: 2,
      background: 'repeating-linear-gradient(90deg,var(--sun-400) 0 14px,transparent 14px 24px)',
      opacity: 0.55
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width,
      maxWidth: '100%',
      marginLeft: `calc((100% - ${width}px) * ${x})`,
      boxSizing: 'border-box',
      background: 'var(--blue-950)',
      border: '3px solid var(--ink)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: dragging ? '0 14px 0 var(--ink), var(--shadow-float)' : 'var(--shadow-pop), var(--shadow-float)',
      transform: dragging ? 'rotate(-1.5deg) scale(1.02)' : 'none',
      transition: dragging ? 'box-shadow var(--dur)' : 'transform var(--dur) var(--ease-pop), box-shadow var(--dur)',
      userSelect: 'none',
      overflow: 'hidden',
      pointerEvents: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onPointerDown: onDown,
    onPointerMove: onMove,
    onPointerUp: onUp,
    onPointerCancel: onUp,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: 40,
      padding: '0 8px 0 12px',
      background: 'var(--grad-sun)',
      borderBottom: '3px solid var(--ink)',
      cursor: draggable ? dragging ? 'grabbing' : 'grab' : 'default',
      touchAction: 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: 14,
      height: 16,
      backgroundImage: 'radial-gradient(var(--ink) 1.6px,transparent 1.8px)',
      backgroundSize: '5px 5px',
      opacity: 0.7
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...pixel(13, 'var(--ink)'),
      flex: 1
    }
  }, "Woo\xB7Amp"), /*#__PURE__*/React.createElement("span", {
    style: pixel(11, 'var(--orange-700)')
  }, draggable ? '◀ drag ▶' : ''), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(o => !o),
    onPointerDown: e => e.stopPropagation(),
    "aria-label": "Toggle playlist",
    "aria-expanded": open,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      height: 26,
      padding: '0 8px',
      borderRadius: 8,
      border: '2px solid var(--ink)',
      background: open ? 'var(--ink)' : 'rgba(255,255,255,.35)',
      color: open ? 'var(--sun-400)' : 'var(--ink)',
      cursor: 'pointer',
      ...pixel(11)
    }
  }, "PL ", /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 14,
    style: {
      transform: open ? 'rotate(180deg)' : 'none',
      transition: 'transform var(--dur) var(--ease-pop)'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'stretch'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      background: '#030817',
      border: '2px solid var(--blue-600)',
      borderRadius: 10,
      padding: '8px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: pixel(24, 'var(--sun-400)')
  }, fmt(t)), /*#__PURE__*/React.createElement("span", {
    style: pixel(11, playing ? 'var(--lime-400)' : 'var(--gray-400)')
  }, playing ? '▶ PLAY' : '❚❚ PAUSE')), /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-block',
      animation: 'tw-marquee 9s linear infinite',
      animationPlayState: playing ? 'running' : 'paused',
      ...pixel(12, 'var(--sky-400)')
    }
  }, marquee, marquee))), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      width: 70,
      display: 'flex',
      alignItems: 'flex-end',
      gap: 3,
      padding: '8px 6px',
      background: '#030817',
      border: '2px solid var(--blue-600)',
      borderRadius: 10,
      boxSizing: 'border-box'
    }
  }, [0.9, 0.5, 0.75, 0.35, 0.6, 1, 0.45, 0.7].map((d, k) => /*#__PURE__*/React.createElement("span", {
    key: k,
    style: {
      flex: 1,
      height: '100%',
      borderRadius: 2,
      transformOrigin: 'bottom',
      background: 'linear-gradient(0deg,var(--lime-400),var(--sun-400) 60%,var(--orange-500))',
      animation: `tw-eq ${0.38 + d * 0.5}s ease-in-out ${k * -0.11}s infinite`,
      animationPlayState: playing ? 'running' : 'paused',
      transform: playing ? undefined : 'scaleY(.18)'
    }
  })))), /*#__PURE__*/React.createElement("input", {
    type: "range",
    "aria-label": "Seek",
    min: 0,
    max: dur || 1,
    step: 0.25,
    value: Math.min(t, dur || 1),
    onChange: e => seek(+e.target.value),
    style: {
      width: '100%',
      accentColor: 'var(--sun-400)',
      margin: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Ctl, {
    label: "Previous",
    onClick: () => go(i - 1)
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "skip-back",
    size: 16
  })), /*#__PURE__*/React.createElement(Ctl, {
    label: playing ? 'Pause' : 'Play',
    big: true,
    onClick: () => setPlaying(p => !p)
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: playing ? 'pause' : 'play',
    size: 20
  })), /*#__PURE__*/React.createElement(Ctl, {
    label: "Stop",
    onClick: () => {
      setPlaying(false);
      seek(0);
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "square",
    size: 14
  })), /*#__PURE__*/React.createElement(Ctl, {
    label: "Next",
    onClick: () => go(i + 1)
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "skip-forward",
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: vol === 0 ? 'volume-x' : 'volume-2',
    size: 18,
    color: "var(--gray-300)"
  }), /*#__PURE__*/React.createElement("input", {
    type: "range",
    "aria-label": "Volume",
    min: 0,
    max: 1,
    step: 0.05,
    value: vol,
    onChange: e => setVol(+e.target.value),
    style: {
      width: 80,
      accentColor: 'var(--orange-500)',
      margin: 0
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: open ? 44 * tracks.length + 16 : 0,
      overflow: 'auto',
      transition: 'max-height var(--dur-slow) var(--ease-out)',
      borderTop: open ? '3px solid var(--ink)' : '0 solid transparent',
      background: 'var(--blue-900)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, tracks.map((x2, k) => /*#__PURE__*/React.createElement("button", {
    key: k,
    type: "button",
    onClick: () => {
      go(k);
      setPlaying(true);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 40,
      padding: '0 10px',
      border: 0,
      borderRadius: 10,
      cursor: 'pointer',
      textAlign: 'left',
      background: k === i ? 'rgba(255,210,31,.14)' : 'transparent'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      ...pixel(12, k === i ? 'var(--sun-400)' : 'var(--gray-400)'),
      width: 22
    }
  }, k === i && playing ? '▶' : String(k + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      fontWeight: k === i ? 700 : 500,
      color: k === i ? 'var(--gray-50)' : 'var(--gray-200)'
    }
  }, x2.title), /*#__PURE__*/React.createElement("span", {
    style: pixel(11, 'var(--gray-400)')
  }, fmt(x2.duration)))))), /*#__PURE__*/React.createElement("audio", {
    ref: audio,
    onTimeUpdate: e => setT(e.currentTarget.currentTime),
    onLoadedMetadata: e => setDur(e.currentTarget.duration),
    onEnded: () => go(i + 1),
    preload: "metadata"
  })));
}
Object.assign(__ds_scope, { DEMO_TRACKS, MusicPlayer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/media/MusicPlayer.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavBar.jsx
try { (() => {
function NavLink({
  href,
  active,
  children,
  onClick
}) {
  const [h, setH] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    onClick: onClick,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      position: 'relative',
      fontFamily: 'var(--font-display)',
      fontSize: 21,
      letterSpacing: '.02em',
      textTransform: 'uppercase',
      textDecoration: 'none',
      padding: '6px 2px',
      color: active ? 'var(--sun-400)' : h ? 'var(--gray-50)' : 'var(--gray-200)',
      transition: 'color var(--dur-fast)'
    }
  }, children, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 4,
      borderRadius: 2,
      background: 'var(--orange-500)',
      transform: `skewX(-20deg) scaleX(${active || h ? 1 : 0})`,
      transformOrigin: 'left',
      transition: 'transform var(--dur) var(--ease-pop)'
    }
  }));
}
function NavBar({
  logo,
  links = [],
  active,
  discordHref = '#',
  onNavigate,
  sticky = true,
  style
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: sticky ? 'sticky' : 'relative',
      top: 0,
      zIndex: 40,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: {
      position: 'absolute',
      inset: '0 0 -10px',
      background: 'var(--glass)',
      backdropFilter: 'var(--blur-glass)',
      WebkitBackdropFilter: 'var(--blur-glass)',
      clipPath: 'polygon(0 0,100% 0,100% 72%,0 100%)'
    }
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 28,
      flexWrap: 'wrap',
      minHeight: 'var(--nav-h)',
      maxWidth: 'var(--container)',
      margin: '0 auto',
      padding: '8px var(--gutter)',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      onNavigate && (e.preventDefault(), onNavigate('home'));
    },
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, logo ? /*#__PURE__*/React.createElement("img", {
    src: logo,
    alt: "Tiny Woo",
    style: {
      height: 56,
      width: 56,
      objectFit: 'cover',
      borderRadius: 14,
      border: '3px solid var(--ink)',
      boxShadow: 'var(--shadow-pop-sm)',
      transform: 'rotate(-4deg)'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 30,
      color: 'var(--sun-400)'
    }
  }, "TINY WOO")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 22,
      flexWrap: 'wrap',
      flex: 1
    }
  }, links.map(l => /*#__PURE__*/React.createElement(NavLink, {
    key: l.id,
    href: l.href || '#' + l.id,
    active: active === l.id,
    onClick: onNavigate ? e => {
      e.preventDefault();
      onNavigate(l.id);
    } : undefined
  }, l.label))), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    variant: "secondary",
    href: discordHref,
    icon: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "discord",
      brand: true,
      size: 18
    })
  }, "Discord")));
}
Object.assign(__ds_scope, { NavBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SocialLinks.jsx
try { (() => {
const DEFAULT_SOCIALS = [{
  brand: 'discord',
  label: 'Discord',
  href: '#'
}, {
  brand: 'youtube',
  label: 'YouTube',
  href: '#'
}, {
  brand: 'x',
  label: 'X',
  href: '#'
}, {
  brand: 'tiktok',
  label: 'TikTok',
  href: '#'
}, {
  brand: 'instagram',
  label: 'Instagram',
  href: '#'
}, {
  brand: 'itchdotio',
  label: 'itch.io',
  href: '#'
}, {
  brand: 'steam',
  label: 'Steam',
  href: '#'
}];
function SocialLinks({
  links = DEFAULT_SOCIALS,
  size = 48,
  tone = 'blue',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      ...style
    }
  }, links.map(l => /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    key: l.brand,
    label: l.label,
    href: l.href,
    size: size,
    tone: l.brand === 'discord' ? 'electric' : tone,
    icon: /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: l.brand,
      brand: true,
      size: Math.round(size * 0.46)
    })
  })));
}
Object.assign(__ds_scope, { DEFAULT_SOCIALS, SocialLinks });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SocialLinks.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Hero.jsx
try { (() => {
(() => {
  const {
    Button,
    Icon,
    Badge
  } = window.TinyWooDesignSystem_fe221f;
  function Ticker({
    items,
    angle = -3,
    tone = 'sun'
  }) {
    const line = items.map(t => t + '  ★  ').join('');
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        zIndex: 2,
        transform: `rotate(${angle}deg)`,
        margin: '0 -40px',
        background: tone === 'sun' ? 'var(--grad-sun)' : 'var(--ink)',
        borderTop: '4px solid var(--ink)',
        borderBottom: '4px solid var(--ink)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        padding: '12px 0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-block',
        animation: 'tw-marquee 22s linear infinite',
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        color: tone === 'sun' ? 'var(--ink)' : 'var(--sun-400)',
        letterSpacing: '.03em'
      }
    }, line, line, line, line));
  }
  function Hero({
    onNav
  }) {
    return /*#__PURE__*/React.createElement("section", {
      style: {
        position: 'relative',
        overflow: 'hidden',
        padding: '40px 0 110px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      "aria-hidden": true,
      className: "tw-stripes",
      style: {
        position: 'absolute',
        inset: '-20% -10% 18% -10%',
        background: 'var(--blue-800)',
        transform: 'skewY(-7deg)',
        borderBottom: '6px solid var(--sun-400)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      "aria-hidden": true,
      style: {
        position: 'absolute',
        right: '-6%',
        top: '8%',
        width: '46%',
        height: '78%',
        background: 'var(--electric-500)',
        transform: 'skewX(-12deg)',
        border: '4px solid var(--ink)',
        boxShadow: '14px 14px 0 var(--ink)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        maxWidth: 'var(--container)',
        margin: '0 auto',
        padding: '0 var(--gutter)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)',
        gap: 40,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        animation: 'tw-pop-in var(--dur-slow) var(--ease-pop)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "lime",
      tilt: true
    }, "Solo indie dev"), /*#__PURE__*/React.createElement(Badge, {
      tone: "outline"
    }, "Est. one guy")), /*#__PURE__*/React.createElement("h1", {
      className: "tw-heading",
      style: {
        fontSize: 'var(--fs-hero)',
        transform: 'rotate(-4deg)',
        transformOrigin: 'left'
      }
    }, "One samurai.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--orange-400)'
      }
    }, "Zero Japan.")), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 'var(--fs-lg)',
        lineHeight: 'var(--lh-body)',
        maxWidth: 480,
        textWrap: 'pretty'
      }
    }, "Tiny Woo is a one-person game studio making fast, loud, slightly rude little games. Grab a controller, bring snacks."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 14,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      size: "lg",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "rocket",
        size: 26
      }),
      onClick: () => onNav('games')
    }, "See games"), /*#__PURE__*/React.createElement(Button, {
      size: "lg",
      variant: "secondary",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "discord",
        brand: true,
        size: 26
      }),
      href: "#"
    }, "Discord"))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/logo/tinywoo-logo.png",
      alt: "Tiny Woo",
      style: {
        width: '100%',
        maxWidth: 440,
        borderRadius: 'var(--radius-xl)',
        border: '5px solid var(--ink)',
        boxShadow: 'var(--shadow-pop-lg), var(--shadow-float)',
        transform: 'rotate(5deg)',
        animation: 'tw-bob 3.2s ease-in-out infinite'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: -6,
        bottom: 10,
        transform: 'rotate(-10deg)'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "sun"
    }, "Now loading\u2026")))));
  }
  Object.assign(window, {
    Hero,
    Ticker
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Sections.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
(() => {
  const {
    Button,
    Icon,
    Badge,
    GameCard,
    SlantSection,
    SocialLinks,
    CrosshairGame
  } = window.TinyWooDesignSystem_fe221f;
  const H2 = ({
    children,
    color,
    style
  }) => /*#__PURE__*/React.createElement("h2", {
    className: "tw-heading",
    style: {
      fontSize: 'var(--fs-h1)',
      transform: 'rotate(-3deg)',
      transformOrigin: 'left',
      color,
      ...style
    }
  }, children);
  const Kicker = ({
    children
  }) => /*#__PURE__*/React.createElement("span", {
    className: "tw-pixel",
    style: {
      fontSize: 13,
      color: 'var(--sky-400)'
    }
  }, children);
  function FeaturedGame({
    onNav
  }) {
    return /*#__PURE__*/React.createElement(SlantSection, {
      tone: "deep",
      angle: -4,
      innerStyle: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)',
        gap: 48,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/games/rocket-trump-menu.jpg",
      alt: "Rocket Trump main menu",
      style: {
        width: '100%',
        display: 'block',
        borderRadius: 'var(--radius-xl)',
        border: '5px solid var(--ink)',
        boxShadow: 'var(--shadow-pop-lg)',
        transform: 'rotate(-2.5deg)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: -14,
        right: 20,
        transform: 'rotate(8deg)'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "cherry"
    }, "First game"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }
    }, /*#__PURE__*/React.createElement(Kicker, null, "Featured \xB7 In development"), /*#__PURE__*/React.createElement(H2, null, "Rocket Trump"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 17,
        lineHeight: 1.55
      }
    }, "Catch rockets, stack coins, hire the Tiger Gang and climb the highscore. Chaotic jungle-base arcade action with a very short fuse."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "outline"
    }, "PC"), /*#__PURE__*/React.createElement(Badge, {
      tone: "outline"
    }, "Arcade"), /*#__PURE__*/React.createElement(Badge, {
      tone: "outline"
    }, "Singleplayer")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "steam",
        brand: true,
        size: 20
      }),
      href: "#"
    }, "Wishlist"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => onNav('games')
    }, "All games"))));
  }
  function ArcadeTeaser({
    onNav
  }) {
    return /*#__PURE__*/React.createElement("section", {
      style: {
        maxWidth: 'var(--container)',
        margin: '0 auto',
        padding: 'var(--space-9) var(--gutter)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)',
        gap: 48,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }
    }, /*#__PURE__*/React.createElement(Kicker, null, "Arcade \xB7 Play right here"), /*#__PURE__*/React.createElement(H2, {
      color: "var(--orange-400)"
    }, "Woo Hunt"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 17,
        lineHeight: 1.55
      }
    }, "45 seconds, 8 shells, zero mercy. Small targets score more. Beat the board, write your name, brag on Discord."), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
      variant: "lime",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "crosshair",
        size: 20
      }),
      onClick: () => onNav('arcade')
    }, "Open arcade"))), /*#__PURE__*/React.createElement("div", {
      style: {
        transform: 'rotate(1.5deg)'
      }
    }, /*#__PURE__*/React.createElement(CrosshairGame, {
      height: 380,
      storageKey: "tw-site-scores"
    })));
  }
  function Community() {
    return /*#__PURE__*/React.createElement(SlantSection, {
      tone: "raised",
      angle: 3,
      edge: "orange",
      innerStyle: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement(H2, {
      style: {
        transform: 'rotate(-2deg)',
        transformOrigin: 'center'
      }
    }, "Join the dojo"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 17,
        maxWidth: 520,
        lineHeight: 1.55
      }
    }, "Devlogs, playtests, memes and the occasional existential crisis. The Discord is where it all happens."), /*#__PURE__*/React.createElement(Button, {
      size: "lg",
      variant: "secondary",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "discord",
        brand: true,
        size: 26
      }),
      href: "#"
    }, "Join Discord"), /*#__PURE__*/React.createElement(SocialLinks, {
      style: {
        justifyContent: 'center'
      }
    }));
  }
  function Footer() {
    return /*#__PURE__*/React.createElement("footer", {
      style: {
        maxWidth: 'var(--container)',
        margin: '0 auto',
        padding: '56px var(--gutter) 200px',
        display: 'flex',
        justifyContent: 'space-between',
        gap: 20,
        flexWrap: 'wrap',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tw-pixel",
      style: {
        fontSize: 12,
        color: 'var(--gray-400)'
      }
    }, "\xA9 2026 Tiny Woo \xB7 Made by one guy with a sword"), /*#__PURE__*/React.createElement("span", {
      className: "tw-pixel",
      style: {
        fontSize: 12,
        color: 'var(--gray-400)'
      }
    }, "Press kit \xB7 Imprint \xB7 Contact"));
  }
  function GamesPage() {
    const games = [{
      title: 'Rocket Trump',
      image: '../../assets/games/rocket-trump-menu.jpg',
      tagline: 'Catch rockets, hire the Tiger Gang, top the board.',
      tags: ['PC', 'Steam'],
      status: 'In dev'
    }];
    return /*#__PURE__*/React.createElement("section", {
      style: {
        maxWidth: 'var(--container)',
        margin: '0 auto',
        padding: '48px var(--gutter) 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 36
      }
    }, /*#__PURE__*/React.createElement(H2, {
      style: {
        fontSize: 'var(--fs-hero)'
      }
    }, "Games"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))',
        gap: 28
      }
    }, games.map(g => /*#__PURE__*/React.createElement(GameCard, _extends({
      key: g.title
    }, g, {
      href: "#"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        border: '4px dashed var(--border-strong)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        transform: 'rotate(1deg)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tw-pixel",
      style: {
        fontSize: 14,
        color: 'var(--gray-400)'
      }
    }, "Next game \xB7 loading\u2026"))));
  }
  function ArcadePage() {
    return /*#__PURE__*/React.createElement("section", {
      style: {
        maxWidth: 'var(--container)',
        margin: '0 auto',
        padding: '48px var(--gutter) 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 28
      }
    }, /*#__PURE__*/React.createElement(H2, {
      color: "var(--orange-400)",
      style: {
        fontSize: 'var(--fs-hero)'
      }
    }, "Arcade"), /*#__PURE__*/React.createElement(CrosshairGame, {
      height: 560,
      storageKey: "tw-site-scores"
    }));
  }
  function AboutPage() {
    return /*#__PURE__*/React.createElement("section", {
      style: {
        maxWidth: 760,
        margin: '0 auto',
        padding: '48px var(--gutter) 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 22
      }
    }, /*#__PURE__*/React.createElement(H2, {
      style: {
        fontSize: 'var(--fs-hero)'
      }
    }, "About"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 19,
        lineHeight: 1.6,
        color: 'var(--text-strong)'
      }
    }, "Tiny Woo is one person: designer, coder, artist, composer, QA, marketing department and coffee machine operator."), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 17,
        lineHeight: 1.6
      }
    }, "A samurai \u2014 not from Japan \u2014 building small, fast games that don't take themselves too seriously. Everything here is made solo."), /*#__PURE__*/React.createElement(SocialLinks, null));
  }
  Object.assign(window, {
    FeaturedGame,
    ArcadeTeaser,
    Community,
    Footer,
    GamesPage,
    ArcadePage,
    AboutPage
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Sections.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.CrosshairGame = __ds_scope.CrosshairGame;

__ds_ns.GameCard = __ds_scope.GameCard;

__ds_ns.SlantSection = __ds_scope.SlantSection;

__ds_ns.DEMO_TRACKS = __ds_scope.DEMO_TRACKS;

__ds_ns.MusicPlayer = __ds_scope.MusicPlayer;

__ds_ns.NavBar = __ds_scope.NavBar;

__ds_ns.DEFAULT_SOCIALS = __ds_scope.DEFAULT_SOCIALS;

__ds_ns.SocialLinks = __ds_scope.SocialLinks;

})();
