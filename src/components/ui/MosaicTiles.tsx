const TILE_COLORS = ["bg-blue", "bg-teal", "bg-coral", "bg-sun", "bg-lilac", "bg-blue-deep"];

interface MosaicTilesProps {
    count?: number;
    className?: string;
    tileClassName?: string;
}

/** מוטיב "אריחי פסיפס" עדין — אלמנט מיתוג דקורטיבי בלבד. */
function MosaicTiles({ count = 6, className = "", tileClassName = "h-2.5 w-2.5" }: MosaicTilesProps) {
    return (
        <span aria-hidden="true" className={`inline-flex items-center gap-1 ${className}`}>
            {Array.from({ length: count }, (_, index) => (
                <span
                    key={index}
                    className={`${tileClassName} rounded-[3px] ${TILE_COLORS[index % TILE_COLORS.length]}`}
                    style={{ opacity: 1 - index * 0.08 }}
                />
            ))}
        </span>
    );
}

export default MosaicTiles;
