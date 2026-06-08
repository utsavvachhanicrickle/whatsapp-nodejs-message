export const getRandomGradient = (seed) => {
  const gradients = [
    "from-purple-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-violet-500",
    "from-teal-500 to-cyan-500",
    "from-rose-500 to-pink-500",
    "from-pink-500 to-purple-500",
    "from-fuchsia-500 to-pink-500",
    "from-rose-500 to-pink-500",
  ];
  const index = (seed?.length || 0) % gradients.length;
  return gradients[index];
};

export const Avatar = ({ name, className = "" }) => {
  return (
    <div
      className={`w-10 h-10 rounded-full bg-linear-to-br ${getRandomGradient(name)} flex items-center justify-center text-white font-bold shrink-0 shadow-md ${className}`}
    >
      <span className="text-xs">
        {(name || "U").slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
};
