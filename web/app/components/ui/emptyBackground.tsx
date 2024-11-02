export const EmptyGridBackground = () => {
  return (<>
    <img src="/assets/beams.jpg" alt="" className="z-0 absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2" />
    <div className=" z-0 absolute inset-0 bg-[url(/assets/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
  </>)
}