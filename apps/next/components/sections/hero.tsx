export default function HeroSection(props) {
	const {title} = props;

	return (
		<section className="w-full h-100 flex flex-col items-center justify-center">
			<h1>{title}</h1>
		</section>
	);
}
