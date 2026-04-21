function Button({
  type = "button",
  children,
  onClick,
  variant = "primary",
  className = "",
  ...props
}) {
  const baseStyle =
    "px-4 py-2 rounded-lg transition-all duration-200 font-medium";

  const variants = {
    primary:
      "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)]",

    outline:
      "bg-transparent text-[var(--btn-outline-text)] border border-[var(--btn-outline-border)] hover:bg-[var(--btn-outline-hover)]",

    danger:
      "text-red-500 border border-red-500 hover:bg-red-500 hover:text-white",

    other:
      "bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:font-semibold",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;