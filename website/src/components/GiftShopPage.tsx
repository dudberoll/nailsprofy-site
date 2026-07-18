import { useMemo, useState, type ReactNode } from "react";
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

type CertificateStepKey =
	| "recipient"
	| "amount"
	| "design"
	| "holder"
	| "buyer"
	| "pin"
	| "review";

type CertificateStep = {
	key: CertificateStepKey;
	title: string;
};

const cx = (...names: Array<string | false | null | undefined>) =>
	names
		.filter(Boolean)
		.map((name) => styles[name as keyof typeof styles])
		.join(" ");

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
const certificateDesigns = Array.from({ length: 10 }, (_, index) => `design-${index + 1}`);
const certificateValidUntil = "до 30 июня 2027 г";

const certificateStepsSelf: CertificateStep[] = [
	{ key: "recipient", title: "Кому предназначен сертификат" },
	{ key: "amount", title: "Выберите номинал" },
	{ key: "design", title: "Выберите дизайн" },
	{ key: "buyer", title: "Ваши данные" },
	{ key: "pin", title: "Подтверждение телефона" },
	{ key: "review", title: "Проверьте данные перед оплатой" },
];

const certificateStepsGift: CertificateStep[] = [
	{ key: "recipient", title: "Кому предназначен сертификат" },
	{ key: "amount", title: "Выберите номинал" },
	{ key: "design", title: "Выберите дизайн" },
	{ key: "buyer", title: "Данные покупателя" },
	{ key: "holder", title: "Данные обладателя" },
	{ key: "pin", title: "Подтверждение телефона" },
	{ key: "review", title: "Проверьте данные перед оплатой" },
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
		"Можно ли купить продукцию по сертификату?",
		"Да, сертификатом можно оплатить продукцию, которая представлена в салоне.",
	],
	[
		"Можно ли использовать сертификат частично?",
		"Да. Если сумма услуги меньше номинала, остаток сохраняется и может быть использован при следующем визите.",
	],
	[
		"Как приобрести сертификат?",
		"Физический сертификат можно приобрести в салоне. Онлайн-покупку и детали оформления уточните у администратора.",
	],
	[
		"Как приобрести абонемент?",
		"Абонемент можно оформить через администратора. Он закрепляется за клиентом и используется по мере посещений.",
	],
	["Срок действия абонемента", "Абонемент действует 12 месяцев со дня покупки."],
];

export default function GiftShopPage() {
	const [mode, setMode] = useState<Mode>("cards");
	const [stepIndex, setStepIndex] = useState(0);
	const [certificateStepIndex, setCertificateStepIndex] = useState(0);
	const [recipient, setRecipient] = useState("");
	const [certificateRecipient, setCertificateRecipient] = useState("");
	const [certificateAmount, setCertificateAmount] = useState("");
	const [certificateDesign, setCertificateDesign] = useState("");
	const [certificateHolderName, setCertificateHolderName] = useState("");
	const [certificateHolderPhone, setCertificateHolderPhone] = useState("");
	const [certificateBuyerName, setCertificateBuyerName] = useState("");
	const [certificateBuyerPhone, setCertificateBuyerPhone] = useState("");
	const [certificateBuyerEmail, setCertificateBuyerEmail] = useState("");
	const [certificatePin, setCertificatePin] = useState("");
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

	const abonementSteps = recipient === "Себе" ? abonementStepsSelf : abonementStepsGift;
	const currentStep = abonementSteps[stepIndex];
	const certificateSteps =
		certificateRecipient === "Себе" ? certificateStepsSelf : certificateStepsGift;
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
		!currentCertificateStep ||
		(currentCertificateStep.key === "recipient" && certificateRecipient) ||
		(currentCertificateStep.key === "amount" && certificateAmount) ||
		(currentCertificateStep.key === "design" && certificateDesign) ||
		(currentCertificateStep.key === "holder" &&
			certificateHolderName &&
			certificateHolderPhone) ||
		(currentCertificateStep.key === "buyer" &&
			certificateBuyerName &&
			certificateBuyerPhone &&
			certificateBuyerEmail) ||
		(currentCertificateStep.key === "pin" && certificatePin.length >= 4) ||
		currentCertificateStep.key === "review";

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
		setCertificateStepIndex((value) => Math.min(value + 1, certificateSteps.length));
	};

	const goCertificateBack = () => {
		if (certificateStepIndex === 0) {
			setMode("cards");
			return;
		}

		setCertificateStepIndex((value) => value - 1);
	};

	return (
		<div className={cx("site-shell")}>
			<section className={cx("hero")} aria-label="Сертификаты и абонементы">
				{mode === "cards" ? (
					<div className={cx("choice-grid")}>
						<button
							className={cx("photo-card", "certificate")}
							type="button"
							onClick={() => {
								setMode("certificate");
								setCertificateStepIndex(0);
							}}
						>
							<span>Сертификат</span>
						</button>
						<button
							className={cx("photo-card", "abonement")}
							type="button"
							onClick={() => {
								setMode("abonement");
								setStepIndex(0);
							}}
						>
							<span>Абонемент</span>
						</button>
					</div>
				) : (
					<div className={cx("wizard-grid")}>
						{mode === "certificate" ? (
							<>
								<div className={cx("wizard-preview", "certificate-preview")}>
									<p>
										{currentCertificateStep
											? `${certificateRecipient === "В подарок" ? "ПОДАРОЧНЫЙ" : "ЛИЧНЫЙ"} СЕРТИФИКАТ`
											: "СЕРТИФИКАТ"}
									</p>
									{currentCertificateStep ? (
										<>
											<span>
												{certificateStepIndex + 1}/{certificateSteps.length}{" "}
												{currentCertificateStep.title}
											</span>
											<ProgressLine
												value={certificateStepIndex + 1}
												max={certificateSteps.length}
											/>
										</>
									) : (
										<span>Сертификат оформлен</span>
									)}
								</div>
								<div className={cx("wizard-panel")}>
									<CertificateBody
										amount={certificateAmount}
										buyerEmail={certificateBuyerEmail}
										buyerName={certificateBuyerName}
										buyerPhone={certificateBuyerPhone}
										currentStep={currentCertificateStep}
										design={certificateDesign}
										holderName={certificateHolderName}
										holderPhone={certificateHolderPhone}
										pin={certificatePin}
										recipient={certificateRecipient}
										setAmount={setCertificateAmount}
										setBuyerEmail={setCertificateBuyerEmail}
										setBuyerName={setCertificateBuyerName}
										setBuyerPhone={setCertificateBuyerPhone}
										setDesign={setCertificateDesign}
										setHolderName={setCertificateHolderName}
										setHolderPhone={setCertificateHolderPhone}
										setPin={setCertificatePin}
										setRecipient={setCertificateRecipient}
									/>
									<div className={cx("wizard-actions")}>
										<button className={cx("back-button")} type="button" onClick={goCertificateBack}>
											Назад
										</button>
										{currentCertificateStep ? (
											<button
												className={cx("continue-button")}
												disabled={!canContinueCertificate}
												type="button"
												onClick={goCertificateNext}
											>
												{currentCertificateStep.key === "review" ? "Перейти к оплате" : "Продолжить"}
											</button>
										) : (
											<button
												className={cx("continue-button")}
												type="button"
												onClick={() => setMode("cards")}
											>
												Вернуться к выбору
											</button>
										)}
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

			<section className={cx("intro")}>
				<h1>Подарочные сертификаты и абонементы NailsProfi</h1>
				<p>
					Сертификат NailsProfi - спокойный и красивый подарок для тех, кому хочется
					подарить уход, выбор и время для себя.
				</p>
				<p>
					Абонемент подойдет для регулярных процедур: можно заранее оплатить курс любимых
					услуг и приходить в удобном ритме в течение года.
				</p>
			</section>

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
	buyerEmail: string;
	buyerName: string;
	buyerPhone: string;
	currentStep: CertificateStep | undefined;
	design: string;
	holderName: string;
	holderPhone: string;
	pin: string;
	recipient: string;
	setAmount: (value: string) => void;
	setBuyerEmail: (value: string) => void;
	setBuyerName: (value: string) => void;
	setBuyerPhone: (value: string) => void;
	setDesign: (value: string) => void;
	setHolderName: (value: string) => void;
	setHolderPhone: (value: string) => void;
	setPin: (value: string) => void;
	setRecipient: (value: string) => void;
}) {
	const ownerName = props.recipient === "В подарок" ? props.holderName : props.buyerName;

	if (!props.currentStep) {
		return (
			<div className={cx("payment")}>
				<p>Сертификат оформлен</p>
				<ProductCard amount={formatRubles(props.amount)} label="Сертификат" ownerName={ownerName} />
				<span>После оплаты сертификат отправляется на {props.buyerEmail || "email покупателя"}.</span>
			</div>
		);
	}

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

	if (props.currentStep.key === "amount") {
		return (
			<div>
				<div className={cx("button-stack", "certificate-amounts")}>
					{certificateAmounts.map((item) => (
						<ChoiceButton
							active={props.amount === item}
							key={item}
							label={`${formatRubles(item)} ₽`}
							onClick={() => props.setAmount(item)}
						/>
					))}
				</div>
				{props.amount ? <CertificateMeta amount={formatRubles(props.amount)} /> : null}
			</div>
		);
	}

	if (props.currentStep.key === "design") {
		return (
			<div className={cx("design-grid", "certificate-designs")}>
				{certificateDesigns.map((item, index) => (
					<button
						className={cx("design-card", props.design === item && "active")}
						key={item}
						type="button"
						onClick={() => props.setDesign(item)}
					>
						<span>Дизайн {index + 1}</span>
					</button>
				))}
			</div>
		);
	}

	if (props.currentStep.key === "holder") {
		return (
			<FormStep>
				<p className={cx("form-head")}>Введите данные будущего обладателя</p>
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
				<CertificateMeta amount={formatRubles(props.amount)} />
			</FormStep>
		);
	}

	if (props.currentStep.key === "buyer") {
		return (
			<FormStep>
				<p className={cx("form-head")}>Введите ваши данные</p>
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
				<CertificateMeta amount={formatRubles(props.amount)} />
			</FormStep>
		);
	}

	if (props.currentStep.key === "pin") {
		return (
			<FormStep>
				<p className={cx("form-head")}>Мы отправили вам код в SMS и WhatsApp</p>
				<input
					className={cx("pin-field")}
					inputMode="numeric"
					maxLength={4}
					placeholder="****"
					value={props.pin}
					onChange={(event) => props.setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
				/>
				<p className={cx("hint")}>Запросить код повторно</p>
			</FormStep>
		);
	}

	return (
		<div className={cx("review")}>
			<div className={cx("ownerinformation", props.recipient === "Себе" && "single")}>
				<div className={cx("ownerinfo")}>
					<div className={cx("abonementinfohead")}>Покупатель:</div>
					<span>{props.buyerName}</span>
					<span>{props.buyerPhone}</span>
					<span>{props.buyerEmail}</span>
				</div>
				{props.recipient === "В подарок" ? (
					<div className={cx("ownerinfo")}>
						<div className={cx("abonementinfohead")}>Обладатель:</div>
						<span>{props.holderName}</span>
						<span>{props.holderPhone}</span>
					</div>
				) : null}
			</div>
			<ProductCard amount={formatRubles(props.amount)} label="Сертификат" ownerName={ownerName} />
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
	return <progress className={cx("progress-line")} max={max} value={value} />;
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
}: {
	amount: string;
	label: "Абонемент" | "Сертификат";
	ownerName: string;
}) {
	return (
		<div className={cx("product-paper")}>
			<strong>
				{label} на {amount} ₽
			</strong>
			<div>
				<span>{ownerName || "Имя получателя"}</span>
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
