export default function Loading() {
  return (
    <main className="relative z-[1] pt-32 pb-24 px-6 flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-2 border-ink/20 border-t-wine rounded-full animate-spin" />
      </div>
    </main>
  );
}
