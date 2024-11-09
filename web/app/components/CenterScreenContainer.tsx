export const CenterScreenContainer = (props: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-sm">{props.children}</div>
    </div>
  );
}
