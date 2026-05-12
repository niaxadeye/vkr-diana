import { cn } from "@/shared/lib/cn";

import ArrowLeft from "@/shared/assets/icons/arrow-left.svg?react";
import ArrowRight from "@/shared/assets/icons/arrow-right.svg?react";
import CartEmpty from "@/shared/assets/icons/cart-empty.svg?react";
import CartFilled from "@/shared/assets/icons/cart-filled.svg?react";
import Account from "@/shared/assets/icons/account.svg?react";
import Close from "@/shared/assets/icons/close.svg?react";
import Menu from "@/shared/assets/icons/menu.svg?react";
import Trash from "@/shared/assets/icons/trash.svg?react";
import Plus from "@/shared/assets/icons/plus.svg?react";
import Minus from "@/shared/assets/icons/minus.svg?react";
import Home from "@/shared/assets/icons/home.svg?react";
import Edit from "@/shared/assets/icons/edit.svg?react";
import Warning from "@/shared/assets/icons/warning.svg?react";
import Person from "@/shared/assets/icons/person.svg?react";
import Mail from "@/shared/assets/icons/mail.svg?react";
import Phone from "@/shared/assets/icons/phone.svg?react";
import Logo from "@/shared/assets/icons/logo.svg?react";

const icons = {
    "arrow-left": ArrowLeft,
    "arrow-right": ArrowRight,
    "cart-empty": CartEmpty,
    "cart-filled": CartFilled,
    account: Account,
    close: Close,
    menu: Menu,
    trash: Trash,
    plus: Plus,
    minus: Minus,
    home: Home,
    edit: Edit,
    warning: Warning,
    person: Person,
    phone : Phone,
    mail : Mail,
    logo : Logo,
};

export type IconName = keyof typeof icons;

type IconProps = {
    name: IconName;
    className?: string;
};

export function Icon({ name, className }: IconProps) {
    const SvgIcon = icons[name];

    return (
        <SvgIcon
            className={cn(
                "h-4 w-4 fill-current [&_*]:fill-current",
                className,
            )}
            aria-hidden="true"
        />
    );
}