import type { ReactNode } from "react";

type Props = {
	href: string;
	children: ReactNode;
	target?: string;
	rel?: string;
};

export default function BookingShaderButton({
	href,
	children,
	target = "_blank",
	rel = "noopener noreferrer",
}: Props) {
	return (
		<a className="shader-booking-button booking-shader-button" href={href} target={target} rel={rel}>
			<span className="booking-shader-button__label">{children}</span>
		</a>
	);
}
