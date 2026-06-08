function Button({
  type = "button",
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) {
  const baseStyle = `
    px-4
    py-2
    rounded-xl
    font-medium
    transition-all
    duration-200
    flex
    items-center
    justify-center
    gap-2
    outline-none
    select-none
    active:scale-[0.98]
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-[var(--primary)]
      text-white
      hover:bg-[var(--primary-hover)]
      focus:ring-2
      focus:ring-[var(--primary)]/30
    `,

    outline: `
      bg-transparent
      border
      border-[var(--border)]
      text-[var(--text-primary)]
      hover:bg-[var(--bg-secondary)]
      focus:ring-2
      focus:ring-[var(--primary)]/20
    `,

    danger: `
      border
      border-red-500
      text-red-500
      hover:bg-red-500
      hover:text-white
      focus:ring-2
      focus:ring-red-500/30
    `,

    other: `
      bg-[var(--bg-secondary)]
      text-[var(--text-primary)]
      hover:bg-[var(--bg-active)]
      focus:ring-2
      focus:ring-[var(--primary)]/20
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyle}
        ${variants[variant] || variants.primary}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;