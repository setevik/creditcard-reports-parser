import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, ArrowRight, CreditCard, Lightbulb } from 'lucide-react';

function ProviderSection({ title, steps, url }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
            <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            {url.replace('https://', '')}
                        </a>
                    </div>
                </div>
                <ol className="space-y-3">
                    {steps.map((step, index) => (
                        <li key={index} className="flex gap-3">
                            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mt-0.5">
                                {index + 1}
                            </span>
                            <span className="text-slate-700">{step}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}

export function ExportGuide({ onBack }) {
    const { t, language } = useLanguage();
    const BackArrow = language === 'he' ? ArrowRight : ArrowLeft;

    const providers = [
        {
            title: t('calTitle'),
            url: 'https://digital-web.cal-online.co.il',
            steps: [t('calStep1'), t('calStep2'), t('calStep3'), t('calStep4'), t('calStep5'), t('calStep6')],
        },
        {
            title: t('maxTitle'),
            url: 'https://www.max.co.il',
            steps: [t('maxStep1'), t('maxStep2'), t('maxStep3'), t('maxStep4'), t('maxStep5')],
        },
        {
            title: t('isracardTitle'),
            url: 'https://digital.isracard.co.il',
            steps: [t('isracardStep1'), t('isracardStep2'), t('isracardStep3'), t('isracardStep4'), t('isracardStep5')],
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-xl shadow-sm ring-1 ring-slate-900/5 hover:text-indigo-600 hover:ring-indigo-500/20 transition-all text-sm font-medium"
                >
                    <BackArrow className="h-4 w-4" />
                    {t('backToApp')}
                </button>
            </div>

            <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {t('exportGuideTitle')}
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                    {t('exportGuideIntro')}
                </p>
            </div>

            {providers.map((provider) => (
                <ProviderSection
                    key={provider.title}
                    title={provider.title}
                    url={provider.url}
                    steps={provider.steps}
                />
            ))}

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">{t('exportGuideTip')}</p>
            </div>
        </div>
    );
}
