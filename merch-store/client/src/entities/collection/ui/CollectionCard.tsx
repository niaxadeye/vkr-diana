import { Link } from "react-router";

import type { CollectionListItem } from "@/entities/collection/api/collection.api";
import { getMediaUrl } from "@/shared/lib/getMediaUrl";

type CollectionCardProps = {
    collection: CollectionListItem;
};

export function CollectionCard({ collection }: CollectionCardProps) {
    const imageUrl = collection.imageUrl
        ? getMediaUrl(collection.imageUrl)
        : null;

    return (
        <Link
            to={`/collections/${collection.slug}`}
            className="group block w-full"
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-[#f0f0f0]">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={collection.title}
                        loading="lazy"
                        draggable={false}
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center px-6 text-center text-[13px] text-[#666666]">
                        Нет изображения
                    </div>
                )}
            </div>

            <div className="pt-3">
                <h3 className="text-[14px] font-[400] uppercase leading-5 tracking-[-0.02em] text-[#060606]">
                    {collection.title}
                </h3>
            </div>
        </Link>
    );
}