import { ChangeEvent, useEffect, useState } from "react";
import { useAPI } from "../../../../hooks/useApi";
import apiConfig from "../../../../config/api.json";
import { emailSettingQueryKey } from "../../../../config/query-key";
import CmsSkeleton from "../../../../components/skeleton/CmsSkeleton";
import Button from "../../../../components/buttons/ButtonStyleOne";
import { postData } from "../../../../services/api-service";
import { getStoredToken } from "../../../../utils/auth-storage";
import { showErrorToast, showSuccessToast } from "../../../../utils/toast-utils";
import {
    FiMail,
    FiServer,
    FiLock,
    FiUser,
    FiCheckCircle,
    FiAlertCircle,
    FiSend,
    FiExternalLink,
    FiEye,
    FiEyeOff
} from "react-icons/fi";

type EmailProvider = "GMAIL" | "CUSTOM_SMTP" | "SENDGRID" | "SES";

interface EmailSettingState {
    provider: EmailProvider;
    host: string;
    port: number;
    secure: boolean;
    emailUser: string;
    emailPass: string;
    hasPassword?: boolean;
    senderName: string;
    senderEmail: string;
    replyTo: string;
    isActive: boolean;
}

const initialValues: EmailSettingState = {
    provider: "GMAIL",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    emailUser: "",
    emailPass: "",
    hasPassword: false,
    senderName: "Fashion Time",
    senderEmail: "",
    replyTo: "",
    isActive: true
};

const requiredFields = [
    { key: "host", value: "host", label: "text" },
    { key: "port", value: "port", label: "text" },
    { key: "emailUser", value: "email user / username", label: "text" },
    { key: "senderName", value: "sender name", label: "text" },
    { key: "senderEmail", value: "sender email", label: "text" }
];

const EmailSettingForm = () => {
    const apiUrl = (apiConfig.setting as any).emailSettingUrl || "email-setting";
    const testApiUrl = (apiConfig.setting as any).emailSettingTestUrl || "email-setting/test";

    const { postMutation, fetchData, handleApiMutation } = useAPI();
    const [fieldValues, setFieldValues] = useState<EmailSettingState>(initialValues);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // Test connection state
    const [testRecipient, setTestRecipient] = useState<string>("");
    const [isTesting, setIsTesting] = useState<boolean>(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        fetchEmailSettingData();
    }, []);

    const fetchEmailSettingData = async () => {
        setIsLoading(true);
        try {
            const result = await fetchData({ apiUrl });
            const data = (result as any)?.data || result;
            if (data) {
                setFieldValues({
                    provider: data.provider || "GMAIL",
                    host: data.host || "smtp.gmail.com",
                    port: Number(data.port) || 465,
                    secure: data.secure !== undefined ? Boolean(data.secure) : true,
                    emailUser: data.emailUser || "",
                    emailPass: data.emailPass || (data.hasPassword ? "••••••••" : ""),
                    hasPassword: Boolean(data.hasPassword),
                    senderName: data.senderName || "Fashion Time",
                    senderEmail: data.senderEmail || data.emailUser || "",
                    replyTo: data.replyTo || "",
                    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
                });
                if (data.emailUser && !testRecipient) {
                    setTestRecipient(data.emailUser);
                }
            }
        } catch {
            showErrorToast("Failed to load email settings.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFieldValues((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFieldValues((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleProviderPreset = (provider: EmailProvider) => {
        if (provider === "GMAIL") {
            setFieldValues((prev) => ({
                ...prev,
                provider: "GMAIL",
                host: "smtp.gmail.com",
                port: 465,
                secure: true
            }));
        } else if (provider === "SENDGRID") {
            setFieldValues((prev) => ({
                ...prev,
                provider: "SENDGRID",
                host: "smtp.sendgrid.net",
                port: 587,
                secure: false,
                emailUser: "apikey"
            }));
        } else if (provider === "SES") {
            setFieldValues((prev) => ({
                ...prev,
                provider: "SES",
                host: "email-smtp.us-east-1.amazonaws.com",
                port: 465,
                secure: true
            }));
        } else {
            setFieldValues((prev) => ({
                ...prev,
                provider: "CUSTOM_SMTP"
            }));
        }
    };

    const handleSubmitForm = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        setTestResult(null);

        const result = await handleApiMutation({
            mutation: postMutation as any,
            url: apiUrl,
            body: {
                ...fieldValues,
                port: Number(fieldValues.port)
            },
            invalidateQueryKey: [emailSettingQueryKey],
            showSuccessMessage: true,
            showErrorMessage: true,
            requiredFields
        });

        if (result?.success) {
            fetchEmailSettingData();
        }
        setIsSaving(false);
    };

    const handleTestConnection = async () => {
        if (!testRecipient || !testRecipient.includes("@")) {
            showErrorToast("Please enter a valid recipient email to receive the test message.");
            return;
        }

        setIsTesting(true);
        setTestResult(null);

        try {
            const token = getStoredToken();
            const response = await postData({
                url: testApiUrl,
                body: {
                    ...fieldValues,
                    port: Number(fieldValues.port),
                    testRecipient: testRecipient.trim()
                },
                token
            }) as any;

            if (response && (response.statusCode === 200 || response.statusCode === 201)) {
                const msg = response?.message || "SMTP verified & test email dispatched successfully!";
                setTestResult({ success: true, message: msg });
                showSuccessToast(msg);
            } else {
                const errorMsg = response?.message || "SMTP handshake failed. Please check host, port, or password.";
                setTestResult({ success: false, message: errorMsg });
                showErrorToast(errorMsg);
            }
        } catch (err: any) {
            const errorMsg =
                err?.response?.data?.message || err?.message || "SMTP connection test failed. Please verify credentials.";
            setTestResult({ success: false, message: errorMsg });
            showErrorToast(errorMsg);
        } finally {
            setIsTesting(false);
        }
    };

    if (isLoading) {
        return <CmsSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Quick Provider Preset Selector */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h4 className="text-sm font-bold text-[var(--ui-text)] flex items-center gap-2">
                            <FiServer className="text-[var(--color-primary)]" /> Select Email Provider Preset
                        </h4>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                            Click a provider to auto-fill recommended SMTP host and port settings.
                        </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="text-xs font-semibold text-[var(--ui-text)]">Active Service</span>
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={fieldValues.isActive}
                            onChange={handleChange}
                            className="toggle toggle-sm toggle-success"
                        />
                    </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { id: "GMAIL", label: "Gmail SMTP", desc: "smtp.gmail.com:465" },
                        { id: "CUSTOM_SMTP", label: "Custom Domain", desc: "mail.yourdomain.com" },
                        { id: "SENDGRID", label: "SendGrid", desc: "smtp.sendgrid.net:587" },
                        { id: "SES", label: "Amazon SES", desc: "email-smtp:465" }
                    ].map((item) => (
                        <button
                            type="button"
                            key={item.id}
                            onClick={() => handleProviderPreset(item.id as EmailProvider)}
                            className={`p-3 text-left rounded-lg border transition cursor-pointer ${
                                fieldValues.provider === item.id
                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--ui-text)] shadow-xs"
                                    : "border-[var(--color-border)] hover:border-gray-300 dark:hover:border-slate-600 text-[var(--color-text-secondary)]"
                            }`}
                        >
                            <p className="text-xs font-bold">{item.label}</p>
                            <p className="text-[11px] opacity-75 font-mono">{item.desc}</p>
                        </button>
                    ))}
                </div>

                {/* Gmail Guidance Banner */}
                {fieldValues.provider === "GMAIL" && (
                    <div className="mt-4 p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                        <FiAlertCircle className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0 text-base" />
                        <div className="space-y-1">
                            <p className="font-semibold">Important note for Gmail accounts:</p>
                            <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
                                Google requires an <strong>App Password</strong> (16 characters) instead of your regular Gmail account password.
                                Make sure 2-Step Verification is ON in your Google Account.
                            </p>
                            <a
                                href="https://myaccount.google.com/apppasswords"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-blue-700 dark:text-blue-300 hover:underline pt-0.5 cursor-pointer"
                            >
                                Generate Gmail App Password <FiExternalLink className="text-[10px]" />
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* SMTP Settings Form */}
            <form onSubmit={handleSubmitForm} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-xs space-y-6">
                <div>
                    <h4 className="text-base font-bold text-[var(--ui-text)] flex items-center gap-2">
                        <FiMail className="text-[var(--color-primary)]" /> SMTP Server Connection
                    </h4>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                        Configure the server host, port, authentication credentials, and default sender identity.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[var(--ui-text)] mb-1">
                            SMTP Host <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="host"
                            required
                            placeholder="e.g. smtp.gmail.com"
                            value={fieldValues.host}
                            onChange={handleChange}
                            className="w-full text-xs p-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--ui-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[var(--ui-text)] mb-1">
                            SMTP Port <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="port"
                            required
                            placeholder="465 or 587"
                            value={fieldValues.port}
                            onChange={handleChange}
                            className="w-full text-xs p-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--ui-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[var(--ui-text)] mb-1">
                            Security / Encryption
                        </label>
                        <select
                            name="secure"
                            value={fieldValues.secure ? "true" : "false"}
                            onChange={(e) => setFieldValues((prev) => ({ ...prev, secure: e.target.value === "true" }))}
                            className="w-full text-xs p-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--ui-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                        >
                            <option value="true">SSL / TLS (Port 465 - Recommended)</option>
                            <option value="false">STARTTLS / Non-secure (Port 587 or 25)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[var(--ui-text)] mb-1 flex items-center gap-1">
                            <FiUser className="text-[var(--color-text-secondary)]" /> Username / Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="emailUser"
                            required
                            placeholder="e.g. yourname@gmail.com"
                            value={fieldValues.emailUser}
                            onChange={handleChange}
                            className="w-full text-xs p-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--ui-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[var(--ui-text)] mb-1 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                                <FiLock className="text-[var(--color-text-secondary)]" /> Password / App Password <span className="text-red-500">*</span>
                            </span>
                            {fieldValues.hasPassword && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                    ✓ Saved & Encrypted
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="emailPass"
                                placeholder={fieldValues.hasPassword ? "•••••••• (Leave blank to keep current)" : "Enter password or 16-char app password"}
                                value={fieldValues.emailPass}
                                onChange={handleChange}
                                className="w-full text-xs p-2.5 pr-10 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--ui-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer text-sm"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[var(--color-border)] pt-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3">
                        Sender Identity & Headers
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-[var(--ui-text)] mb-1">
                                Sender Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="senderName"
                                required
                                placeholder="e.g. Fashion Time"
                                value={fieldValues.senderName}
                                onChange={handleChange}
                                className="w-full text-xs p-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--ui-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--ui-text)] mb-1">
                                Sender Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="senderEmail"
                                required
                                placeholder="e.g. support@fashiontime.com"
                                value={fieldValues.senderEmail}
                                onChange={handleChange}
                                className="w-full text-xs p-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--ui-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[var(--ui-text)] mb-1">
                                Reply-To Email (Optional)
                            </label>
                            <input
                                type="email"
                                name="replyTo"
                                placeholder="e.g. replies@fashiontime.com"
                                value={fieldValues.replyTo}
                                onChange={handleChange}
                                className="w-full text-xs p-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--ui-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                        type="submit"
                        isLoading={isSaving}
                        buttonClass="px-5 py-2.5 font-bold shadow-md cursor-pointer"
                        label="Save Email Configuration"
                    />
                </div>
            </form>

            {/* Live Test Connection & Delivery Verification Card */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-[var(--ui-text)] flex items-center gap-2">
                            <FiSend className="text-[var(--color-primary)]" /> Test SMTP Handshake &amp; Live Delivery
                        </h4>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                            Verify your credentials and dispatch a test email instantly without having to place an actual order.
                        </p>
                    </div>
                </div>

                {testResult && (
                    <div
                        className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                            testResult.success
                                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                                : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200"
                        }`}
                    >
                        {testResult.success ? (
                            <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 text-base mt-0.5 shrink-0" />
                        ) : (
                            <FiAlertCircle className="text-red-600 dark:text-red-400 text-base mt-0.5 shrink-0" />
                        )}
                        <div>
                            <p className="font-bold">{testResult.success ? "Success!" : "Connection Error:"}</p>
                            <p className="mt-0.5 text-[11px] leading-relaxed">{testResult.message}</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="email"
                        placeholder="Enter email to receive test message (e.g. you@gmail.com)"
                        value={testRecipient}
                        onChange={(e) => setTestRecipient(e.target.value)}
                        className="flex-1 text-xs p-2.5 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--ui-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    />
                    <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                    >
                        {isTesting ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Testing Connection...
                            </>
                        ) : (
                            <>
                                <FiSend /> Test Connection &amp; Send Mail
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailSettingForm;
