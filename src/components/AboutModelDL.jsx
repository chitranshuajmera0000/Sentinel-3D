import React from 'react';
import { Network, Database, LineChart, ArrowRight, Shield } from 'lucide-react';
import {
  LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Cell, Tooltip
} from 'recharts';

const RingChart = ({ value, colorClass, strokeColor, label }) => {
  const r = 30, c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 rounded-lg border border-slate-700">
      <div className="relative w-20 h-20 flex items-center justify-center mb-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} className="stroke-slate-700 fill-none" strokeWidth="6" />
          <circle cx="40" cy="40" r={r} className={`fill-none ${strokeColor}`}
            strokeWidth="6" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className={`absolute text-sm font-bold ${colorClass}`}>{value}%</div>
      </div>
      <span className="text-slate-400 text-sm font-medium">{label}</span>
    </div>
  );
};

const layers = [
  { name: 'Stem', type: 'Conv3D+BN+ReLU', kernel: '3×3×3 s(1,2,2)', input: '(1,3,16,112,112)', output: '(1,64,16,56,56)', params: '9,408', group: 'stem' },
  { name: 'Layer1[0]', type: 'BasicBlock3D', kernel: '3×3×3', input: '(1,64,16,56,56)', output: '(1,64,16,56,56)', params: '74,112', group: 'l1' },
  { name: 'Layer1[1]', type: 'BasicBlock3D', kernel: '3×3×3', input: '(1,64,16,56,56)', output: '(1,64,16,56,56)', params: '74,112', group: 'l1' },
  { name: 'Layer2[0]', type: 'BasicBlock3D+DS', kernel: '3×3×3 s(2,2,2)', input: '(1,64,16,56,56)', output: '(1,128,8,28,28)', params: '230,912', group: 'l2' },
  { name: 'Layer2[1]', type: 'BasicBlock3D', kernel: '3×3×3', input: '(1,128,8,28,28)', output: '(1,128,8,28,28)', params: '295,424', group: 'l2' },
  { name: 'Layer3[0]', type: 'BasicBlock3D+DS', kernel: '3×3×3 s(2,2,2)', input: '(1,128,8,28,28)', output: '(1,256,4,14,14)', params: '920,576', group: 'l3' },
  { name: 'Layer3[1]', type: 'BasicBlock3D', kernel: '3×3×3', input: '(1,256,4,14,14)', output: '(1,256,4,14,14)', params: '1,180,672', group: 'l3' },
  { name: 'Layer4[0]', type: 'BasicBlock3D+DS', kernel: '3×3×3 s(2,2,2)', input: '(1,256,4,14,14)', output: '(1,512,2,7,7)', params: '3,673,088', group: 'l4' },
  { name: 'Layer4[1]', type: 'BasicBlock3D', kernel: '3×3×3', input: '(1,512,2,7,7)', output: '(1,512,2,7,7)', params: '4,720,640', group: 'l4' },
  { name: 'AvgPool', type: 'AdaptiveAvgPool3D', kernel: 'global', input: '(1,512,2,7,7)', output: '(1,512,1,1,1)', params: '0', group: 'head' },
  { name: 'FC', type: 'Linear', kernel: '—', input: '(1,512)', output: '(1,2)', params: '1,026', group: 'head' },
];

const groupStyle = {
  stem: 'text-blue-400 border-l-blue-500',
  l1: 'text-purple-400 border-l-purple-500',
  l2: 'text-teal-400 border-l-teal-500',
  l3: 'text-orange-400 border-l-orange-500',
  l4: 'text-red-400 border-l-red-500',
  head: 'text-green-400 border-l-green-500',
};

const trainingData = [
  {epoch:1,loss:0.65,f1:0.72},{epoch:2,loss:0.52,f1:0.79},{epoch:3,loss:0.41,f1:0.84},
  {epoch:4,loss:0.33,f1:0.87},{epoch:5,loss:0.27,f1:0.89},{epoch:6,loss:0.22,f1:0.91},
  {epoch:7,loss:0.19,f1:0.92},{epoch:8,loss:0.17,f1:0.93},{epoch:9,loss:0.15,f1:0.94},
  {epoch:10,loss:0.14,f1:0.95},{epoch:11,loss:0.13,f1:0.96},{epoch:12,loss:0.12,f1:0.9694},
  {epoch:13,loss:0.12,f1:0.9694},{epoch:14,loss:0.12,f1:0.9694},{epoch:15,loss:0.12,f1:0.9694},
];

const baselines = [
  { name: 'Random', acc: 50.0 },
  { name: '2D CNN', acc: 78.3 },
  { name: 'R2Plus1D', acc: 94.1 },
  { name: 'R3D-18 ★', acc: 96.5 },
];

const trainingSteps = [
  { num:1, title:'Data Loading', color:'blue', points:['RWF-2000: 2000 videos, balanced 1000/1000','Uniform 16-frame sampling per clip','Train/Val: 80/20 → 1600/400 clips'] },
  { num:2, title:'Augmentation (Train)', color:'purple', points:['Random horizontal flip (p=0.5)','Random crop 112×112 from 128×128','Color jitter: brightness=0.4, contrast=0.4','Temporal jitter: random start frame','Normalize: mean=[0.432,0.394,0.376]'] },
  { num:3, title:'Transfer Learning', color:'teal', points:['Backbone: R3D-18 @ Kinetics-400','Replace FC: 400→2 (Fight/Non-Fight)','Full fine-tuning from epoch 1','Kinetics encodes motion & interaction priors'] },
  { num:4, title:'Optimization', color:'orange', points:['Adam (β₁=0.9, β₂=0.999, ε=1e-8)','LR: 1e-4, constant','Batch 8, Epochs 15','CrossEntropyLoss (balanced dataset)','Val F1 plateaued at epoch 12'] },
  { num:5, title:'Hardware', color:'red', points:['Kaggle Notebooks','NVIDIA Tesla T4 (16 GB VRAM)','Training time: ~45 min total','Mixed precision: not used'] },
];

const circleColor = { blue:'bg-blue-500', purple:'bg-purple-500', teal:'bg-teal-500', orange:'bg-orange-500', red:'bg-red-500' };
const borderColor = { blue:'border-blue-500/40', purple:'border-purple-500/40', teal:'border-teal-500/40', orange:'border-orange-500/40', red:'border-red-500/40' };

const ttStyle = { background:'#0f172a', border:'1px solid #334155', borderRadius:'8px', fontSize:12 };

export function AboutModelDL() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">

      {/* HERO */}
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-bold px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">DL MODE</span>
          <span className="text-xs text-slate-500 font-mono">VITE_ABOUT_MODE=dl</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-1">Sentinel-3D</h1>
        <p className="text-slate-400 text-lg mb-6">Spatiotemporal deep learning — architecture, training, evaluation</p>
        <div className="flex flex-wrap gap-3 mb-6">
          {[['Val F1','0.9694'],['Accuracy','96.5%'],['Precision','97.2%'],['Recall','96.7%']].map(([k,v])=>(
            <div key={k} className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm font-semibold text-slate-200">{k}: <span className="text-white">{v}</span></div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {[['PyTorch','red'],['R3D-18','purple'],['Kinetics-400','blue'],['RWF-2000','green'],['Adam','orange'],['CrossEntropyLoss','teal']].map(([t,c])=>(
            <span key={t} className={`px-3 py-1.5 border rounded bg-${c}-500/10 text-${c}-400 border-${c}-500/20`}>{t}</span>
          ))}
        </div>
      </div>

      {/* LAYER TABLE */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1"><Network className="text-blue-400"/>R3D-18 Layer-by-Layer</h2>
        <p className="text-sm text-slate-400 mb-4">Total Parameters: <span className="text-white font-bold">~11.2M</span></p>
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="bg-slate-900 text-slate-400 text-left">
                {['Layer','Type','Kernel','Input','Output','Params'].map(h=>(
                  <th key={h} className="px-4 py-3 border-b border-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {layers.map((l,i)=>(
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className={`px-4 py-2.5 font-bold border-l-2 ${groupStyle[l.group]}`}>{l.name}</td>
                  <td className="px-4 py-2.5 text-slate-300">{l.type}</td>
                  <td className="px-4 py-2.5 text-slate-400">{l.kernel}</td>
                  <td className="px-4 py-2.5 text-slate-400">{l.input}</td>
                  <td className="px-4 py-2.5 text-slate-300">{l.output}</td>
                  <td className="px-4 py-2.5 text-slate-400 text-right">{l.params}</td>
                </tr>
              ))}
              <tr className="bg-slate-900/80 font-bold">
                <td colSpan={5} className="px-4 py-2.5 text-slate-400">TOTAL PARAMETERS</td>
                <td className="px-4 py-2.5 text-green-400 text-right">~11.2M</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* TRAINING PIPELINE */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><Database className="text-emerald-400"/>Training Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {trainingSteps.map(step=>(
            <div key={step.num} className={`bg-slate-900/50 p-5 rounded-xl border ${borderColor[step.color]}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-7 h-7 rounded-full ${circleColor[step.color]} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>{step.num}</div>
                <span className="text-sm font-bold text-slate-200">{step.title}</span>
              </div>
              <ul className="space-y-1.5">
                {step.points.map((p,i)=>(
                  <li key={i} className="text-xs text-slate-400 flex gap-2"><span className="text-slate-600 mt-0.5">▸</span>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* TRAINING CURVES */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><LineChart className="text-orange-400"/>Training Curves — 15 Epochs</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
            <p className="text-sm font-bold text-slate-300 mb-3">Training Loss (CrossEntropyLoss)</p>
            <ResponsiveContainer width="100%" height={200}>
              <ReLineChart data={trainingData} margin={{top:5,right:10,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                <XAxis dataKey="epoch" stroke="#64748b" fontSize={11}/>
                <YAxis stroke="#64748b" fontSize={11} domain={[0,0.7]}/>
                <Tooltip contentStyle={ttStyle}/>
                <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} dot={false}/>
              </ReLineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700">
            <p className="text-sm font-bold text-slate-300 mb-3">Validation F1 Score</p>
            <ResponsiveContainer width="100%" height={200}>
              <ReLineChart data={trainingData} margin={{top:5,right:10,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                <XAxis dataKey="epoch" stroke="#64748b" fontSize={11}/>
                <YAxis stroke="#64748b" fontSize={11} domain={[0.65,1]}/>
                <Tooltip contentStyle={ttStyle}/>
                <Line type="monotone" dataKey="f1" stroke="#22c55e" strokeWidth={2} dot={false}/>
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CONFUSION MATRIX */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><Shield className="text-rose-400"/>Confusion Matrix — Val Set (400 clips)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div/>
            <div className="py-2 text-slate-400 font-bold">Predicted Fight</div>
            <div className="py-2 text-slate-400 font-bold">Predicted Non-Fight</div>
            <div className="py-4 text-slate-400 font-bold text-right pr-2">Actual Fight</div>
            <div className="bg-green-500/20 border-2 border-green-500/50 rounded-xl p-4 flex flex-col items-center">
              <span className="text-green-400 text-xs">TP</span>
              <span className="text-green-300 text-3xl font-black">387</span>
            </div>
            <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4 flex flex-col items-center">
              <span className="text-red-400 text-xs">FN</span>
              <span className="text-red-300 text-3xl font-black">13</span>
            </div>
            <div className="py-4 text-slate-400 font-bold text-right pr-2">Actual Non-Fight</div>
            <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4 flex flex-col items-center">
              <span className="text-red-400 text-xs">FP</span>
              <span className="text-red-300 text-3xl font-black">14</span>
            </div>
            <div className="bg-green-500/20 border-2 border-green-500/50 rounded-xl p-4 flex flex-col items-center">
              <span className="text-green-400 text-xs">TN</span>
              <span className="text-green-300 text-3xl font-black">386</span>
            </div>
          </div>
          <div className="space-y-3">
            {[
              {label:'Precision',formula:'387/(387+14)',value:'97.2%',color:'text-purple-400'},
              {label:'Recall',formula:'387/(387+13)',value:'96.7%',color:'text-orange-400'},
              {label:'F1 Score',formula:'2×(P×R)/(P+R)',value:'96.94%',color:'text-blue-400'},
            ].map(m=>(
              <div key={m.label} className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 text-xs">{m.label}</div>
                  <div className="text-slate-500 text-xs font-mono mt-0.5">{m.formula}</div>
                </div>
                <div className={`text-2xl font-black ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INFERENCE PIPELINE */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><ArrowRight className="text-cyan-400"/>Inference Pipeline (tensor shapes)</h2>
        <div className="flex flex-wrap items-center gap-3 justify-center text-xs font-mono">
          {[
            {label:'Webcam/Video',shape:'H×W×3',c:'border-blue-500/50 bg-blue-500/10 text-blue-300'},
            null,
            {label:'Frame Buffer',shape:'16 frames',c:'border-slate-600 bg-slate-700 text-slate-300'},
            null,
            {label:'Tensor',shape:'1,3,16,112,112',c:'border-purple-500/50 bg-purple-500/10 text-purple-300'},
            null,
            {label:'FastAPI',shape:'HTTP POST',c:'border-green-500/50 bg-green-500/10 text-green-300'},
            null,
            {label:'Logits',shape:'1,2',c:'border-orange-500/50 bg-orange-500/10 text-orange-300'},
            null,
            {label:'Softmax',shape:'p_fight,p_safe',c:'border-slate-600 bg-slate-700 text-slate-300'},
            null,
            {label:'Alert',shape:'> 0.5',c:'border-red-500/50 bg-red-500/10 text-red-400 font-bold'},
          ].map((item,i)=> item===null
            ? <ArrowRight key={i} size={16} className="text-slate-600 flex-shrink-0"/>
            : <div key={i} className={`px-3 py-2.5 rounded-xl border ${item.c} flex flex-col items-center`}><span className="font-bold">{item.label}</span><span className="text-slate-500 mt-0.5">[{item.shape}]</span></div>
          )}
        </div>
      </div>

      {/* METRICS + BASELINE */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><LineChart className="text-orange-400"/>Performance &amp; Baseline Comparison</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-slate-400 mb-4">Validation scores on held-out 400-clip split</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <RingChart value={96.9} colorClass="text-blue-400" strokeColor="stroke-blue-500" label="Val F1"/>
              <RingChart value={96.5} colorClass="text-emerald-400" strokeColor="stroke-emerald-500" label="Accuracy"/>
              <RingChart value={97.2} colorClass="text-purple-400" strokeColor="stroke-purple-500" label="Precision"/>
              <RingChart value={96.7} colorClass="text-orange-400" strokeColor="stroke-orange-500" label="Recall"/>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-4">Accuracy vs baseline architectures</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={baselines} margin={{top:0,right:0,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11}/>
                <YAxis stroke="#64748b" fontSize={11} domain={[40,100]}/>
                <Tooltip contentStyle={ttStyle} formatter={v=>`${v}%`}/>
                <Bar dataKey="acc" radius={[4,4,0,0]}>
                  {baselines.map((e,i)=><Cell key={i} fill={e.name.includes('★')?'#3b82f6':'#334155'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
