import quip from "quip-apps-api";
import {ReactNode, useEffect, useRef} from "react";

interface DialogProps {
    onDismiss: () => void;
    children: ReactNode;
}

const Dialog = (props: DialogProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // mount
        quip.apps.showBackdrop(props.onDismiss);
        if (containerRef.current) {
            quip.apps.addDetachedNode(containerRef.current);
        }

        return () => {
            quip.apps.dismissBackdrop();
            if (containerRef.current) {
                quip.apps.removeDetachedNode(containerRef.current);
            }
        };
    }, []);

    const dimensions = quip.apps.getCurrentDimensions();
    const style: React.CSSProperties = {
        // @ts-ignore
        width: dimensions.width,
        // @ts-ignore
        height: dimensions.height,
    };
    return (
        <div ref={containerRef} style={style} className="dialog">
            {props.children}
        </div>
    );
};

export default Dialog;
