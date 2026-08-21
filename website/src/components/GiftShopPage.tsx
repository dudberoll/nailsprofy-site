import { useEffect, useMemo, useState, type ReactNode } from "react";
import data from "../data/nailsprofi.json";
import styles from "./GiftShopPage.module.css";

type StepKey =
	| "recipient"
	| "service"
	| "options"
	| "design"
	| "holder"
	| "buyer"
	| "pin"
	| "review"
	| "payment";

type Step = {
	key: StepKey;
	title: string;
};

type Mode = "cards" | "certificate" | "abonement";

type CertificateStepKey = "amount" | "review";

type CertificateStep = {
	key: CertificateStepKey;
	title: string;
};

const cx = (...names: Array<string | false | null | undefined>) =>
	names
		.filter(Boolean)
		.map((name) => styles[name as keyof typeof styles])
		.join(" ");

const publicAsset = (path: string) =>
	`${import.meta.env.BASE_URL.replace(/\/?$/, "/")}${path.replace(/^\/+/, "")}`;

const contactPhones = data.contacts.phones.map((phone) => ({
	label: phone,
	href: `tel:${phone.replace(/[^\d+]/g, "")}`,
}));
const contactMessengers = [
	{
		label: "Telegram",
		href: data.contacts.social_urls.find((url) => url.includes("t.me")) ?? "https://t.me/nailsprofisalon",
		icon: publicAsset("icons/telegram.svg"),
	},
	{
		label: "WhatsApp",
		href: "https://wa.me/79258816886",
		icon: publicAsset("icons/whatsapp.svg"),
	},
	{
		label: "MAX",
		href: "https://max.ru/u/f9LHodD0cOK3kMd5x1hZThcVGMcFBsnv7oPHD113S5S_GjKpYBSPzf8joNo",
		icon: publicAsset("icons/max.svg"),
	},
] as const;

const abonementStepsSelf: Step[] = [
	{ key: "recipient", title: "Кому предназначен абонемент" },
	{ key: "service", title: "Выберите услугу" },
	{ key: "options", title: "Выберите опции" },
	{ key: "design", title: "Выберите дизайн" },
	{ key: "buyer", title: "Ваши данные" },
	{ key: "pin", title: "Подтверждение телефона" },
	{ key: "review", title: "Проверка заказа" },
	{ key: "payment", title: "Оплата" },
];

const abonementStepsGift: Step[] = [
	{ key: "recipient", title: "Кому предназначен абонемент" },
	{ key: "service", title: "Выберите услугу" },
	{ key: "options", title: "Выберите опции" },
	{ key: "design", title: "Выберите дизайн" },
	{ key: "buyer", title: "Данные покупателя" },
	{ key: "holder", title: "Данные обладателя" },
	{ key: "pin", title: "Подтверждение телефона" },
	{ key: "review", title: "Проверка заказа" },
	{ key: "payment", title: "Оплата" },
];

const certificateAmounts = ["10000", "5000", "3000", "2000"];
const physicalCertificateAmounts = ["10000", "5000"];
const certificateValidUntil = "до 30 июня 2027 г";
const certificatePaymentLinks: Record<string, string> = {
	"2000": "https://o7828.yclients.com/certificates/441579",
	"3000": "https://o7828.yclients.com/certificates/441558",
	"5000": "https://o7828.yclients.com/certificates/441558",
	"10000": "https://o7828.yclients.com/certificates/441587",
};

const certificateSteps: CertificateStep[] = [
	{ key: "amount", title: "Выберите номинал" },
	{ key: "review", title: "Проверьте выбранный сертификат" },
];

const services = [
	"Маникюр без покрытия",
	"Пилочный маникюр без покрытия",
	"Комплекс маникюра с покрытием лака",
	"Комплекс маникюра с покрытием гель-лака",
	"Комплекс пилочного маникюра с покрытием лака",
	"Комплекс пилочного маникюра с покрытием гель-лака",
	"Коррекция бровей",
	"Ламинирование бровей",
	"Ламинирование ресниц",
	"Уход для волос",
];

const faqs = [
	[
		"Можно ли оформить сертификат на свою сумму?",
		"Сертификаты доступны на фиксированные номиналы: 10 000, 5 000, 3 000 и 2 000 рублей.",
	],
	[
		"Можно ли использовать сертификат частично?",
		"Да. Если сумма услуги меньше номинала, остаток сохраняется и может быть использован при следующем визите.",
	],
	[
		"Как приобрести сертификат?",
		"Физический сертификат можно приобрести только в салоне. Электронный сертификат можно заказать онлайн — он придёт на вашу электронную почту.",
	],
];

export default function GiftShopPage() {
	const [mode, setMode] = useState<Mode>("cards");
	const [stepIndex, setStepIndex] = useState(0);
	const [certificateStepIndex, setCertificateStepIndex] = useState(0);
	const [recipient, setRecipient] = useState("");
	const [certificateAmount, setCertificateAmount] = useState("");
	const [isPhysicalCertificate, setIsPhysicalCertificate] = useState(false);
	const [service, setService] = useState("");
	const [quantity, setQuantity] = useState("");
	const [master, setMaster] = useState("");
	const [design, setDesign] = useState("");
	const [holderName, setHolderName] = useState("");
	const [holderPhone, setHolderPhone] = useState("");
	const [buyerName, setBuyerName] = useState("");
	const [buyerPhone, setBuyerPhone] = useState("");
	const [buyerEmail, setBuyerEmail] = useState("");
	const [pin, setPin] = useState("");
	const [accepted, setAccepted] = useState(false);
	const [isContactModalOpen, setIsContactModalOpen] = useState(false);

	useEffect(() => {
		if (!isContactModalOpen) return undefined;

		const previousOverflow = document.body.style.overflow;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsContactModalOpen(false);
		};

		document.body.style.overflow = "hidden";
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isContactModalOpen]);

	const abonementSteps = recipient === "Себе" ? abonementStepsSelf : abonementStepsGift;
	const currentStep = abonementSteps[stepIndex];
	const currentCertificateStep = certificateSteps[certificateStepIndex];
	const amount = useMemo(() => {
		const base = quantity === "10" ? 26600 : 13300;
		const multiplier = master === "Мастер-эксперт" ? 1.3 : master === "Топ-мастер" ? 1.15 : 1;

		return Math.round(base * multiplier).toLocaleString("ru-RU");
	}, [master, quantity]);

	const canContinue =
		(currentStep.key === "recipient" && recipient) ||
		(currentStep.key === "service" && service) ||
		(currentStep.key === "options" && quantity && master) ||
		(currentStep.key === "design" && design) ||
		(currentStep.key === "holder" && holderName && holderPhone) ||
		(currentStep.key === "buyer" && buyerName && buyerPhone && buyerEmail) ||
		(currentStep.key === "pin" && pin.length >= 4) ||
		(currentStep.key === "review" && accepted) ||
		currentStep.key === "payment";
	const canContinueCertificate =
		currentCertificateStep.key === "amount" ? Boolean(certificateAmount) : true;

	const goNext = () => {
		if (!canContinue) return;
		setStepIndex((value) => Math.min(value + 1, abonementSteps.length - 1));
	};

	const goBack = () => {
		if (stepIndex === 0) {
			setMode("cards");
			return;
		}

		setStepIndex((value) => value - 1);
	};

	const goCertificateNext = () => {
		if (!canContinueCertificate) return;
		if (isPhysicalCertificate) {
			setIsContactModalOpen(true);
			return;
		}

		if (currentCertificateStep.key === "review") {
			const paymentUrl = certificatePaymentLinks[certificateAmount];
			if (paymentUrl) window.location.assign(paymentUrl);
			return;
		}

		setCertificateStepIndex((value) => Math.min(value + 1, certificateSteps.length - 1));
	};

	const goCertificateBack = () => {
		if (certificateStepIndex === 0) {
			setMode("cards");
			setIsPhysicalCertificate(false);
			setIsContactModalOpen(false);
			return;
		}

		setCertificateStepIndex((value) => value - 1);
	};

	return (
		<div className={cx("site-shell")}>
			<section className={cx("intro")}>
				<h1>Подарочные сертификаты NailsProfi</h1>
				<p>
					Сертификат NailsProfi - спокойный и красивый подарок для тех, кому хочется
					подарить уход, выбор и время для себя.
				</p>
			</section>

			<section className={cx("hero")} aria-label="Подарочные сертификаты">
				{mode === "cards" ? (
					<div className={cx("choice-grid")}>
						<div className={cx("choice-item")}>
							<button
								aria-label="Электронный сертификат"
								className={cx("photo-card", "certificate")}
								type="button"
								onClick={() => {
									setMode("certificate");
									setIsPhysicalCertificate(false);
									setCertificateAmount("");
									setCertificateStepIndex(0);
									setIsContactModalOpen(false);
								}}
							/>
							<p className={cx("choice-caption")}>Электронный сертификат</p>
						</div>
						<div className={cx("choice-item")}>
							<button
								aria-label="Физический сертификат"
								className={cx("photo-card", "abonement")}
								type="button"
								onClick={() => {
									setMode("certificate");
									setIsPhysicalCertificate(true);
									setCertificateAmount("");
									setCertificateStepIndex(0);
									setIsContactModalOpen(false);
								}}
							/>
							<p className={cx("choice-caption")}>Физический сертификат</p>
						</div>
					</div>
				) : (
					<div className={cx("wizard-grid")}>
						{mode === "certificate" ? (
							<>
								<div className={cx("wizard-preview", "certificate-preview")}>
									<p>
										{isPhysicalCertificate
											? "ФИЗИЧЕСКИЙ СЕРТИФИКАТ"
											: "ЭЛЕКТРОННЫЙ СЕРТИФИКАТ"}
									</p>
									<span>
										{isPhysicalCertificate ? 1 : certificateStepIndex + 1}/
										{isPhysicalCertificate ? 1 : certificateSteps.length}{" "}
										{currentCertificateStep.title}
									</span>
									<ProgressLine
										value={isPhysicalCertificate ? 1 : certificateStepIndex + 1}
										max={isPhysicalCertificate ? 1 : certificateSteps.length}
									/>
								</div>
								<div className={cx("wizard-panel")}>
									<CertificateBody
										amount={certificateAmount}
										amounts={isPhysicalCertificate ? physicalCertificateAmounts : certificateAmounts}
										currentStep={currentCertificateStep}
										isPhysicalCertificate={isPhysicalCertificate}
										setAmount={setCertificateAmount}
									/>
									<div className={cx("wizard-actions")}>
										<button className={cx("back-button")} type="button" onClick={goCertificateBack}>
											Назад
										</button>
										<button
											className={cx("continue-button")}
											disabled={!canContinueCertificate}
											type="button"
											onClick={goCertificateNext}
										>
											{isPhysicalCertificate
												? "Связаться с администратором"
												: currentCertificateStep.key === "review"
													? "Перейти к оплате"
													: "Продолжить"}
										</button>
									</div>
								</div>
							</>
						) : (
							<>
								<div className={cx("wizard-preview")}>
									<p>
										{currentStep.key === "payment"
											? "АБОНЕМЕНТ"
											: recipient === "В подарок"
												? "ПОДАРОЧНЫЙ АБОНЕМЕНТ"
												: "АБОНЕМЕНТ"}
									</p>
									<span>
										{stepIndex + 1}/{abonementSteps.length} {currentStep.title}
									</span>
									<ProgressLine value={stepIndex + 1} max={abonementSteps.length} />
								</div>
								<div className={cx("wizard-panel")}>
									<WizardBody
										accepted={accepted}
										amount={amount}
										buyerEmail={buyerEmail}
										buyerName={buyerName}
										buyerPhone={buyerPhone}
										currentStep={currentStep}
										design={design}
										holderName={holderName}
										holderPhone={holderPhone}
										master={master}
										pin={pin}
										quantity={quantity}
										recipient={recipient}
										service={service}
										setAccepted={setAccepted}
										setBuyerEmail={setBuyerEmail}
										setBuyerName={setBuyerName}
										setBuyerPhone={setBuyerPhone}
										setDesign={setDesign}
										setHolderName={setHolderName}
										setHolderPhone={setHolderPhone}
										setMaster={setMaster}
										setPin={setPin}
										setQuantity={setQuantity}
										setRecipient={setRecipient}
										setService={setService}
									/>
									<div className={cx("wizard-actions")}>
										<button className={cx("back-button")} type="button" onClick={goBack}>
											Назад
										</button>
										<button
											className={cx("continue-button")}
											disabled={!canContinue}
											type="button"
											onClick={goNext}
										>
											{currentStep.key === "payment" ? "Готово" : "Продолжить"}
										</button>
									</div>
								</div>
							</>
						)}
					</div>
				)}
			</section>

			{isContactModalOpen ? (
				<div
					className={cx("contact-modal-backdrop")}
					onClick={(event) => {
						if (event.target === event.currentTarget) setIsContactModalOpen(false);
					}}
				>
					<div
						aria-labelledby="physical-contact-title"
						aria-modal="true"
						className={cx("contact-modal")}
						role="dialog"
					>
						<button
							aria-label="Закрыть окно связи"
							autoFocus
							className={cx("contact-modal__close")}
							type="button"
							onClick={() => setIsContactModalOpen(false)}
						>
							<span aria-hidden="true">×</span>
						</button>
						<p className={cx("contact-modal__eyebrow")}>Физический сертификат</p>
						<h2 id="physical-contact-title">Связаться с администратором</h2>
						<p className={cx("contact-modal__text")}>Выберите удобный способ связи.</p>
						<div className={cx("contact-modal__phones")}>
							{contactPhones.map((phone) => (
								<a className={cx("contact-modal__phone")} href={phone.href} key={phone.href}>
									{phone.label}
								</a>
							))}
						</div>
						<div className={cx("contact-modal__divider")}>
							<span>или напишите</span>
						</div>
						<div className={cx("contact-modal__messengers")} aria-label="Написать в мессенджере">
							{contactMessengers.map((messenger) => (
								<a
									aria-label={`Написать в ${messenger.label}`}
									className={cx("contact-modal__messenger")}
									href={messenger.href}
									key={messenger.label}
									rel="noopener noreferrer"
									target="_blank"
									onClick={() => setIsContactModalOpen(false)}
								>
									<img src={messenger.icon} alt="" width="24" height="24" />
								</a>
							))}
						</div>
					</div>
				</div>
			) : null}

			<section className={cx("faq")}>
				<h2>Ответы на частые вопросы</h2>
				<div className={cx("faq-list")}>
					{faqs.map(([question, answer]) => (
						<details key={question}>
							<summary>{question}</summary>
							<p>{answer}</p>
						</details>
					))}
				</div>
			</section>
		</div>
	);
}

function CertificateBody(props: {
	amount: string;
	amounts: string[];
	currentStep: CertificateStep;
	isPhysicalCertificate: boolean;
	setAmount: (value: string) => void;
}) {
	if (props.currentStep.key === "amount") {
		return (
			<div>
				<div className={cx("button-stack", "certificate-amounts")}>
					{props.amounts.map((item) => (
						<ChoiceButton
							active={props.amount === item}
							key={item}
							label={`${formatRubles(item)} ₽`}
							onClick={() => props.setAmount(item)}
						/>
					))}
				</div>
				{props.amount ? <CertificateMeta amount={formatRubles(props.amount)} /> : null}
				{props.isPhysicalCertificate && props.amount ? (
					<p className={cx("physical-certificate-note")}>
						Физический сертификат можно приобрести только в салоне. Онлайн-покупка недоступна.
					</p>
				) : null}
			</div>
		);
	}

	return (
		<div className={cx("review")}>
			<ProductCard
				amount={formatRubles(props.amount)}
				label="Сертификат"
				ownerName=""
				showOwnerName={false}
			/>
			<p className={cx("underline")}>
				Нажимая кнопку «Перейти к оплате», вы принимаете оферту и предоставляете
				согласие на обработку персональных данных
			</p>
		</div>
	);
}

function WizardBody(props: {
	accepted: boolean;
	amount: string;
	buyerEmail: string;
	buyerName: string;
	buyerPhone: string;
	currentStep: Step;
	design: string;
	holderName: string;
	holderPhone: string;
	master: string;
	pin: string;
	quantity: string;
	recipient: string;
	service: string;
	setAccepted: (value: boolean) => void;
	setBuyerEmail: (value: string) => void;
	setBuyerName: (value: string) => void;
	setBuyerPhone: (value: string) => void;
	setDesign: (value: string) => void;
	setHolderName: (value: string) => void;
	setHolderPhone: (value: string) => void;
	setMaster: (value: string) => void;
	setPin: (value: string) => void;
	setQuantity: (value: string) => void;
	setRecipient: (value: string) => void;
	setService: (value: string) => void;
}) {
	if (props.currentStep.key === "recipient") {
		return (
			<div className={cx("button-stack")}>
				{["В подарок", "Себе"].map((item) => (
					<ChoiceButton
						active={props.recipient === item}
						key={item}
						label={item}
						onClick={() => props.setRecipient(item)}
					/>
				))}
			</div>
		);
	}

	if (props.currentStep.key === "service") {
		return (
			<div className={cx("button-stack", "scroll-stack")}>
				{services.map((item) => (
					<ChoiceButton
						active={props.service === item}
						key={item}
						label={item}
						onClick={() => props.setService(item)}
					/>
				))}
			</div>
		);
	}

	if (props.currentStep.key === "options") {
		return (
			<div className={cx("options-step")}>
				<div className={cx("option-row")}>
					<span>Количество</span>
					{["5", "10"].map((item) => (
						<ChoiceButton
							active={props.quantity === item}
							key={item}
							label={item}
							onClick={() => props.setQuantity(item)}
						/>
					))}
				</div>
				<div className={cx("master-row")}>
					{["Мастер", "Топ-мастер", "Мастер-эксперт"].map((item) => (
						<ChoiceButton
							active={props.master === item}
							key={item}
							label={item}
							onClick={() => props.setMaster(item)}
						/>
					))}
				</div>
				{props.quantity && props.master ? <Price amount={props.amount} /> : null}
			</div>
		);
	}

	if (props.currentStep.key === "design") {
		return (
			<div className={cx("design-grid")}>
				{Array.from({ length: 6 }, (_, index) => {
					const item = `design-${index + 1}`;

					return (
						<button
							className={cx("design-card", props.design === item && "active")}
							key={item}
							type="button"
							onClick={() => props.setDesign(item)}
						>
							<span>Дизайн {index + 1}</span>
						</button>
					);
				})}
			</div>
		);
	}

	if (props.currentStep.key === "holder") {
		return (
			<FormStep>
				<input
					placeholder="Имя Фамилия"
					value={props.holderName}
					onChange={(event) => props.setHolderName(event.target.value)}
				/>
				<input
					inputMode="tel"
					placeholder="+7 999 999 99 99"
					value={props.holderPhone}
					onChange={(event) => props.setHolderPhone(event.target.value)}
				/>
				<Price amount={props.amount} />
			</FormStep>
		);
	}

	if (props.currentStep.key === "buyer") {
		return (
			<FormStep>
				<input
					placeholder="Имя Фамилия"
					value={props.buyerName}
					onChange={(event) => props.setBuyerName(event.target.value)}
				/>
				<input
					inputMode="tel"
					placeholder="+7 999 999 99 99"
					value={props.buyerPhone}
					onChange={(event) => props.setBuyerPhone(event.target.value)}
				/>
				<input
					inputMode="email"
					placeholder="name@email.com"
					value={props.buyerEmail}
					onChange={(event) => props.setBuyerEmail(event.target.value)}
				/>
				<Price amount={props.amount} />
			</FormStep>
		);
	}

	if (props.currentStep.key === "pin") {
		return (
			<FormStep>
				<input
					inputMode="numeric"
					maxLength={4}
					placeholder="****"
					value={props.pin}
					onChange={(event) => props.setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
				/>
				<p className={cx("hint")}>Введите тестовый код из 4 цифр</p>
			</FormStep>
		);
	}

	if (props.currentStep.key === "review") {
		return (
			<div className={cx("review")}>
				<Summary label="Кому" value={props.recipient} />
				<Summary label="Услуга" value={props.service} />
				<Summary label="Опции" value={`${props.quantity} процедур, ${props.master}`} />
				<Summary label="Покупатель" value={props.buyerName || "Не указано"} />
				<Summary
					label="Обладатель"
					value={
						props.recipient === "Себе"
							? props.buyerName || "Не указано"
							: props.holderName || "Не указано"
					}
				/>
				<Summary label="Итого" value={`${props.amount} ₽`} />
				<label className={cx("check-row")}>
					<input
						checked={props.accepted}
						type="checkbox"
						onChange={(event) => props.setAccepted(event.target.checked)}
					/>
					<span>Согласен с правилами обслуживания</span>
				</label>
			</div>
		);
	}

	return (
		<div className={cx("payment")}>
			<p>Абонемент оформлен</p>
			<ProductCard
				amount={props.amount}
				label="Абонемент"
				ownerName={props.recipient === "Себе" ? props.buyerName : props.holderName}
			/>
			<span>Переход к реальной оплате пока отключен.</span>
		</div>
	);
}

function ChoiceButton({
	active,
	label,
	onClick,
}: {
	active: boolean;
	label: string;
	onClick: () => void;
}) {
	return (
		<button className={cx("choice-button", active && "active")} type="button" onClick={onClick}>
			{label}
		</button>
	);
}

function ProgressLine({ value, max }: { value: number; max: number }) {
	const percentage = Math.min(100, Math.max(0, (value / max) * 100));

	return (
		<div
			aria-label="Индикатор шага"
			aria-valuemax={max}
			aria-valuemin={0}
			aria-valuenow={value}
			className={cx("progress-line")}
			role="progressbar"
			style={{
				background: `linear-gradient(90deg, #78635d 0 ${percentage}%, rgb(255 255 255 / 38%) ${percentage}% 100%)`,
			}}
		/>
	);
}

function formatRubles(value: string) {
	return value ? Number(value).toLocaleString("ru-RU") : "";
}

function FormStep({ children }: { children: ReactNode }) {
	return <div className={cx("form-step")}>{children}</div>;
}

function Price({ amount }: { amount: string }) {
	return (
		<div className={cx("price-row")}>
			<span>Срок действия 1 год</span>
			<strong>{amount} ₽</strong>
		</div>
	);
}

function ProductCard({
	amount,
	label,
	ownerName,
	showOwnerName = true,
}: {
	amount: string;
	label: "Абонемент" | "Сертификат";
	ownerName: string;
	showOwnerName?: boolean;
}) {
	return (
		<div className={cx("product-paper")}>
			<strong>
				{label} на {amount} ₽
			</strong>
			<div>
				{showOwnerName ? <span>{ownerName || "Имя получателя"}</span> : null}
				<small>{certificateValidUntil}</small>
			</div>
		</div>
	);
}

function CertificateMeta({ amount }: { amount: string }) {
	return (
		<div className={cx("price-row", "certificate-meta")}>
			<span>{certificateValidUntil}</span>
			<strong>{amount} ₽</strong>
		</div>
	);
}

function Summary({ label, value }: { label: string; value: string }) {
	return (
		<div className={cx("summary-row")}>
			<span>{label}</span>
			<strong>{value}</strong>
		</div>
	);
}
