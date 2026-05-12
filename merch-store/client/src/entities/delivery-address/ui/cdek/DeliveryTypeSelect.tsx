import type { DeliveryType } from "../../model/deliveryAddress.types";

type DeliveryTypeSelectProps = {
  value: DeliveryType;
  onChange: (value: DeliveryType) => void;
};

const deliveryTypes: Array<{
  value: DeliveryType;
  label: string;
}> = [
  {
    value: "courier",
    label: "Курьер",
  },
  {
    value: "cdek_pickup",
    label: "Пункт выдачи СДЭК",
  },
];

export function DeliveryTypeSelect({
  value,
  onChange,
}: DeliveryTypeSelectProps) {
  return (
    <div>
      <label className="mb-2 block text-[16px] font-[400] leading-5 text-[#060606]">
        Тип доставки
      </label>

      <div className="grid gap-3 grid-cols-2">
        {deliveryTypes.map((type) => {
          const isSelected = value === type.value;

          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              className={[
                "h-11 rounded-2xl border px-4 text-left text-[14px] font-[400] outline-none transition",
                "focus:border-2 focus:border-black",
                isSelected
                  ? "border-black font-[500] bg-black text-white"
                  : "border-neutral-300 bg-white text-[#060606] hover:border-black hover:border-2",
              ].join(" ")}
            >
              {type.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}