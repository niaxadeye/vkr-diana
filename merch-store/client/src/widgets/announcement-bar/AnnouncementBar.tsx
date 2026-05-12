type AnnouncementBarProps = {
  text?: string;
};

export function AnnouncementBar({ text }: AnnouncementBarProps) {
  if (!text) return null;

  return (
    <div className="bg-black px-5 py-[13px] text-center text-[13px] font-semibold leading-5 text-white md:text-[14px]">
      {text}
    </div>
  );
}