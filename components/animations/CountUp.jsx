'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function CountUp({ value, duration = 1.2, className = '', style = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    const suffix = String(value).replace(/[0-9.]/g, '');
    const isInt = !String(value).includes('.');

    gsap.fromTo(
      { val: 0 },
      { val: num, duration, ease: 'power2.out',
        onUpdate: function () {
          el.textContent = (isInt ? Math.round(this.targets()[0].val) : this.targets()[0].val.toFixed(1)) + suffix;
        },
      }
    );
  }, [value, duration]);

  return (
    <span ref={ref} className={className} style={style}>
      {value}
    </span>
  );
}
