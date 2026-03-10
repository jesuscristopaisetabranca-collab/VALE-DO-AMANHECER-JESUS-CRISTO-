/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ShieldCheck, 
  Sun, 
  Heart, 
  CheckCircle2, 
  PlayCircle,
  Award,
  BookOpen
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 selection:bg-amber-100">
      {/* Navigation / Header */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-8 h-8 text-amber-500 fill-amber-500/20" />
            <span className="font-serif italic text-xl font-bold tracking-tight text-slate-900">
              Vale do Amanhecer
            </span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <a href="#beneficios" className="hover:text-amber-600 transition-colors">Benefícios</a>
            <a href="#metodo" className="hover:text-amber-600 transition-colors">O Método</a>
            <a href="#garantia" className="hover:text-amber-600 transition-colors">Garantia</a>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#E0F2F1] to-white pt-20 pb-32">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-200 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-200 rounded-full blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-emerald-100 text-emerald-800 rounded-full">
                Missão Jaguar: O Chamado de Pai Seta Branca
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 leading-[1.1] mb-6">
                Doutrinador: Domine a Ciência de Tia Neiva e <span className="text-emerald-700 italic">Cumpra seu Dever Sagrado</span> — Porque Fora da Caridade não há Salvação.
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                Acesse o método iniciático que revela como manipular as forças espirituais com precisão para realizar curas reais e evoluir sua jornada como Jaguar.
              </p>
            </motion.div>

            {/* VSL Placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative max-w-3xl mx-auto aspect-video bg-slate-900 rounded-2xl shadow-2xl overflow-hidden group cursor-pointer border-4 border-white"
            >
              <img 
                src="https://picsum.photos/seed/spirit/1200/675" 
                alt="Thumbnail VSL" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-10 h-10 fill-white text-amber-500" />
                </div>
                <p className="text-xl font-bold mb-2 drop-shadow-md">O Segredo da Cura que Tia Neiva Revelou</p>
                <p className="text-sm opacity-80 max-w-md">Assista e descubra como elevar sua vibração e cumprir sua missão espiritual.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12"
            >
              <button className="group relative px-10 py-5 bg-amber-500 hover:bg-amber-600 text-white text-xl font-bold rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:-translate-y-1 active:scale-95">
                Quero ser curado!
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-300 animate-pulse" />
              </button>
              <p className="mt-4 text-sm text-slate-500 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Acesso imediato ao portal de estudos
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="beneficios" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">
                Transformações Reais no Vale do Amanhecer
              </h2>
              <p className="text-slate-600">Baseado nos ensinamentos iniciáticos de Tia Neiva</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Heart className="w-8 h-8 text-rose-500" />,
                  title: "Equilíbrio Mediúnico",
                  desc: "Alcance a estabilidade necessária para atuar com segurança nos trabalhos do Templo."
                },
                {
                  icon: <BookOpen className="w-8 h-8 text-emerald-500" />,
                  title: "Leis do Amanhecer",
                  desc: "Compreensão profunda das leis que regem o Doutrinador e o Apará."
                },
                {
                  icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
                  title: "Proteção Espiritual",
                  desc: "Fortaleça sua aura através do conhecimento iniciático e da manipulação correta das energias."
                },
                {
                  icon: <Sun className="w-8 h-8 text-amber-500" />,
                  title: "Paz Interior",
                  desc: "Clareza mental e serenidade para conduzir trabalhos de desobsessão e cura."
                },
                {
                  icon: <Award className="w-8 h-8 text-purple-500" />,
                  title: "Maestria Doutrinária",
                  desc: "Torne-se um Jaguar preparado para os desafios da Nova Era."
                }
              ].map((benefit, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all"
                >
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Guarantee Section */}
        <section id="garantia" className="py-24 bg-[#F1F8E9]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-block p-4 bg-white rounded-full shadow-sm mb-8">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" 
                alt="Selo de Garantia" 
                className="w-16 h-16"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">Sua Missão Sem Riscos</h2>
            <p className="text-lg text-slate-700 mb-8 leading-relaxed">
              Temos tanta confiança nos estudos deixados por Tia Neiva que oferecemos uma 
              <span className="font-bold"> Garantia Incondicional de 7 Dias</span>. Se por qualquer motivo você sentir que este conhecimento não é para você, devolvemos seu investimento integralmente. Sem perguntas, sem burocracia.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-emerald-800">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Satisfação Garantida</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Risco Zero</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Compromisso Espiritual</span>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-slate-900 text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
              Jesus Cristo, o Sol da Terra, te chama.
            </h2>
            <p className="text-slate-400 mb-10 text-lg">
              Não deixe para amanhã o cumprimento do seu dever espiritual. O Vale do Amanhecer espera por você.
            </p>
            <button className="px-12 py-6 bg-amber-500 hover:bg-amber-600 text-white text-2xl font-bold rounded-full shadow-lg transition-all hover:scale-105 active:scale-95">
              Quero ser curado!
            </button>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sun className="w-6 h-6 text-amber-500" />
            <span className="font-serif italic text-lg font-bold text-slate-900">Vale do Amanhecer</span>
          </div>
          <p className="text-slate-500 text-sm mb-2">
            "Salve Deus! Onde houver um Jaguar, haverá uma luz acesa."
          </p>
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} Portal de Estudos Doutrinários. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
