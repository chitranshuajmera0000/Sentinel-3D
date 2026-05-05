import React from 'react';
import { Eye, ArrowRight, LineChart } from 'lucide-react';

const RingChart = ({ value, colorClass, strokeColor, label }) => {
  const r = 30, c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex flex-col items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700">
      <div className="relative w-20 h-20 flex items-center justify-center mb-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} className="stroke-slate-700 fill-none" strokeWidth="6" />
          <circle cx="40" cy="40" r={r} className={`fill-none ${strokeColor}`}
            strokeWidth="6" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className={`absolute text-sm font-bold ${colorClass}`}>{value}%</div>
      </div>
      <span className="text-slate-400 text-sm">{label}</span>
    </div>
  );
};

const techniques = [
  {
    num: 1, badge: 'Classical CV', badgeColor: 'bg-slate-600/50 text-slate-300',
    title: 'Spatial Preprocessing & Normalization',
    what: 'Standardizing pixel distributions before feeding to neural networks',
    how: 'Each frame resized to 128×128, then center-cropped to 112×112. Per-channel normalization: subtract mean [0.432, 0.394, 0.376], divide by std [0.228, 0.221, 0.217] — values derived from Kinetics-400. Training uses random horizontal flip + random crop.',
    why: 'Aligns input distribution with Kinetics-400 pretraining distribution, enabling effective transfer learning.',
  },
  {
    num: 2, badge: 'Classical CV', badgeColor: 'bg-slate-600/50 text-slate-300',
    title: 'Temporal Sampling (Uniform Frame Sampling)',
    what: 'Selecting a fixed number of representative frames from a variable-length video',
    how: 'Each clip uniformly sampled to exactly 16 frames. Indices: [0, L/16, 2L/16 … 15L/16] where L = total clip length. Creates consistent temporal coverage without duplication or large gaps.',
    why: 'Fight actions have variable durations — uniform sampling ensures the model always sees the full temporal arc of an action.',
  },
  {
    num: 3, badge: 'Signal Processing', badgeColor: 'bg-cyan-900/50 text-cyan-300',
    title: 'Sliding Window Inference (Temporal Windowing)',
    what: 'Analyzing streaming video data using a technique borrowed from signal processing',
    how: 'Incoming frames accumulate in a circular buffer of size 16. Once the buffer fills, it is dispatched as one inference window and the buffer resets. Converts continuous frame stream into discrete temporal segments.',
    why: 'Enables real-time processing of arbitrary-length video without retraining — the model always receives exactly 16 frames.',
  },
  {
    num: 4, badge: 'Deep CV', badgeColor: 'bg-purple-900/50 text-purple-300',
    title: '3D Convolution (Spatiotemporal Feature Extraction)',
    what: 'Extension of standard 2D convolution into the temporal dimension',
    how: 'R3D-18 applies 3D kernels of size 3×3×3 (time × height × width). For feature map (C,T,H,W), each kernel slides across all three dimensions simultaneously, encoding motion direction, speed, and texture in a single operation. Stem uses kernel (3,7,7) with temporal stride 1.',
    why: 'Single-frame 2D CNNs cannot distinguish a punch from a handshake — the motion trajectory across time is the discriminative signal.',
  },
  {
    num: 5, badge: 'Classical + Deep CV', badgeColor: 'bg-teal-900/50 text-teal-300',
    title: 'Spatial Downsampling & Hierarchical Pooling',
    what: 'Progressive reduction of spatial resolution to build hierarchical features',
    how: 'Each of 4 ResNet stages halves spatial resolution via stride-2 conv. Feature maps: 56×56 → 28×28 → 14×14 → 7×7. Temporal dimension also halved: 16→8→4→2 frames. AdaptiveAvgPool3D collapses (512,2,7,7) → (512,1,1,1) — a single 512-dim descriptor for the 16-frame window.',
    why: 'Early layers detect edges/motion; deep layers detect semantic actions like punches or kicks.',
  },
  {
    num: 6, badge: 'Classical CV', badgeColor: 'bg-slate-600/50 text-slate-300',
    title: 'Data Augmentation (Spatial & Temporal)',
    what: 'Artificially expanding training data with label-preserving transforms',
    how: 'Spatial: random horizontal flip, random crop 128→112px, color jitter (±0.4 brightness/contrast). Temporal: random start-frame selection (temporal jitter). Not used: vertical flip, large rotation (unnatural for surveillance footage).',
    why: 'RWF-2000 has only 1600 training clips. Temporal jitter increases effective dataset size ~16×.',
  },
  {
    num: 7, badge: 'Deep CV', badgeColor: 'bg-purple-900/50 text-purple-300',
    title: 'Transfer Learning (Domain Adaptation from Kinetics-400)',
    what: 'Initializing a model with weights learned on a large source domain',
    how: 'R3D-18 pretrained on Kinetics-400 (306,245 videos, 400 classes). All conv layers initialize with these weights; only FC is randomly initialized (400→2). Full fine-tuning unfreezes everything from epoch 1.',
    why: 'Kinetics classes include "punching", "wrestling", "slapping" — directly relevant motion priors for fight detection.',
  },
  {
    num: 8, badge: 'Classical ML', badgeColor: 'bg-green-900/50 text-green-300',
    title: 'Softmax Classification & Threshold Decision',
    what: 'Converting raw model outputs to calibrated probabilities + binary decision',
    how: 'Logits [f_fight, f_nonfight] → Softmax: p_fight = exp(f_fight)/(exp(f_fight)+exp(f_nonfight)). Binary decision: alert if p_fight > 0.5 (default). Lowering threshold increases recall at cost of precision.',
    why: 'Gives an interpretable probability, not just a class label, enabling confidence-based alerting and threshold tuning.',
  },
];

const cvTable = [
  ['Spatial Normalization','Preprocessing','Both modes','Classical'],
  ['Temporal Sampling','Frame Selection','Upload mode','Classical'],
  ['Sliding Window','Real-time Inference','Live mode','Signal Processing'],
  ['3D Convolution','Feature Extraction','Both modes','Deep CV'],
  ['AdaptiveAvgPool3D','Global Descriptor','Both modes','Deep CV'],
  ['Random Crop/Flip','Augmentation','Training only','Classical'],
  ['Color Jitter','Augmentation','Training only','Classical'],
  ['Temporal Jitter','Augmentation','Training only','Classical'],
  ['Softmax + Threshold','Decision','Both modes','Classical ML'],
  ['Transfer Learning','Domain Adaptation','Both modes','Deep CV'],
];

const depthColor = {
  Classical: 'bg-slate-600/50 text-slate-300',
  'Signal Processing': 'bg-cyan-900/50 text-cyan-300',
  'Deep CV': 'bg-purple-900/50 text-purple-300',
  'Classical ML': 'bg-green-900/50 text-green-300',
};

export function AboutModelCV() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">

      {/* HERO */}
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-bold px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded">CV MODE</span>
          <span className="text-xs text-slate-500 font-mono">VITE_ABOUT_MODE=cv</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-1">Sentinel-3D</h1>
        <p className="text-lg text-slate-400 mb-6">Classical CV meets deep spatiotemporal learning for violent action recognition</p>
        <div className="flex flex-wrap gap-3 mb-6">
          {[['Val F1','0.9694'],['Input','112×112'],['Temporal Window','16 frames'],['FPS','30']].map(([k,v])=>(
            <div key={k} className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm font-semibold text-slate-200">{k}: <span className="text-white">{v}</span></div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {[['OpenCV','green'],['PyTorch','red'],['R3D-18','purple'],['YOLO','orange'],['Pose Est.','blue'],['Optical Flow','teal']].map(([t,c])=>(
            <span key={t} className={`px-3 py-1.5 border rounded bg-${c}-500/10 text-${c}-400 border-${c}-500/20`}>{t}</span>
          ))}
        </div>
      </div>

      {/* CV TECHNIQUE STACK */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><Eye className="text-green-400"/>CV Technique Stack</h2>
        <div className="space-y-4">
          {techniques.map(t => (
            <div key={t.num} className="bg-slate-900/60 p-5 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 mt-0.5">{t.num}</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-base font-bold text-slate-100">{t.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${t.badgeColor}`}>{t.badge}</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                    <div><span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">What</span><p className="text-slate-400 text-[13px]">{t.what}</p></div>
                    <div><span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">How Used</span><p className="text-slate-400 text-[13px]">{t.how}</p></div>
                    <div><span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-1">Why It Matters</span><p className="text-slate-300 text-[13px]">{t.why}</p></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FRAME PROCESSING VISUAL */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><ArrowRight className="text-cyan-400"/>Frame Processing Pipeline (with data shapes)</h2>
        <div className="flex flex-wrap items-center gap-3 justify-center text-xs font-mono">
          {[
            {label:'Raw Frame',shape:'H×W×3',c:'border-blue-500/50 bg-blue-500/10 text-blue-300'},
            null,
            {label:'Resize',shape:'128×128',c:'border-slate-600 bg-slate-700 text-slate-300'},
            null,
            {label:'Random Crop',shape:'112×112',c:'border-slate-600 bg-slate-700 text-slate-300'},
            null,
            {label:'Normalize',shape:'per channel',c:'border-slate-600 bg-slate-700 text-slate-300'},
            null,
            {label:'Stack 16 Frames',shape:'buffer',c:'border-teal-500/50 bg-teal-500/10 text-teal-300'},
            null,
            {label:'Tensor',shape:'1,3,16,112,112',c:'border-purple-500/50 bg-purple-500/10 text-purple-300'},
            null,
            {label:'3D CNN',shape:'→ (1,512)',c:'border-orange-500/50 bg-orange-500/10 text-orange-300'},
            null,
            {label:'Classifier',shape:'p_fight',c:'border-red-500/50 bg-red-500/10 text-red-400 font-bold'},
          ].map((item,i)=> item===null
            ? <ArrowRight key={i} size={16} className="text-slate-600 flex-shrink-0"/>
            : <div key={i} className={`px-3 py-2.5 rounded-xl border ${item.c} flex flex-col items-center text-center`}><span className="font-bold">{item.label}</span><span className="text-slate-500 mt-0.5">[{item.shape}]</span></div>
          )}
        </div>
      </div>

      {/* TEMPORAL WINDOW VISUALIZATION */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><Eye className="text-orange-400"/>Temporal Sliding Window</h2>
        <div className="space-y-6">
          <div>
            <p className="text-xs text-slate-500 mb-3 font-mono">Window 1 — frames 1–16</p>
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({length:24}).map((_,i)=>(
                <div key={i} className={`w-9 h-9 rounded flex items-center justify-center text-[10px] font-bold border-2 transition-all ${i<16 ? 'bg-blue-500/30 border-blue-500 text-blue-200' : 'bg-slate-700/50 border-slate-600 text-slate-500'}`}>
                  {i+1}
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500/30 border border-blue-500 rounded"/>
              <span className="text-xs text-blue-400">Frames in Window 1 → dispatched to model</span>
              <div className="w-3 h-3 bg-slate-700/50 border border-slate-600 rounded ml-4"/>
              <span className="text-xs text-slate-500">Buffered (not yet dispatched)</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-3 font-mono">Window 2 — frames 17–24 (buffering…)</p>
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({length:24}).map((_,i)=>(
                <div key={i} className={`w-9 h-9 rounded flex items-center justify-center text-[10px] font-bold border-2 ${i<16 ? 'bg-slate-700/30 border-slate-700 text-slate-600' : 'bg-green-500/30 border-green-500 text-green-200'}`}>
                  {i+1}
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500/30 border border-green-500 rounded"/>
              <span className="text-xs text-green-400">Frames accumulating in buffer for Window 2</span>
            </div>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-700 text-xs text-slate-400 font-mono">
            Buffer fills every 16 frames → dispatch → reset → repeat (at 30 fps ≈ 0.53s per window)
          </div>
        </div>
      </div>

      {/* CV TECHNIQUE TABLE */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4"><Eye className="text-blue-400"/>CV Technique Reference Table</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 text-slate-400 text-left">
                {['Technique','Category','Applied In','CV Depth'].map(h=>(
                  <th key={h} className="px-4 py-3 border-b border-slate-700 font-semibold text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cvTable.map(([t,cat,where,depth],i)=>(
                <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="px-4 py-3 text-slate-200 font-medium text-sm">{t}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{cat}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{where}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${depthColor[depth]}`}>{depth}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PERFORMANCE METRICS */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><LineChart className="text-orange-400"/>Performance Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <RingChart value={96.9} colorClass="text-blue-400" strokeColor="stroke-blue-500" label="Val F1"/>
          <RingChart value={96.5} colorClass="text-emerald-400" strokeColor="stroke-emerald-500" label="Accuracy"/>
          <RingChart value={97.2} colorClass="text-purple-400" strokeColor="stroke-purple-500" label="Precision"/>
          <RingChart value={96.7} colorClass="text-orange-400" strokeColor="stroke-orange-500" label="Recall"/>
        </div>
        <div className="space-y-3">
          {[
            {metric:'High Precision (97.2%)',meaning:'Very few false alarms — security staff are not overwhelmed with spurious alerts.', color:'text-purple-400'},
            {metric:'High Recall (96.7%)',meaning:'Very few missed fights — critical in surveillance where missing an incident has real consequences.', color:'text-orange-400'},
            {metric:'Balanced F1 (96.94%)',meaning:"The model doesn't sacrifice recall for precision or vice versa — it excels at both simultaneously.", color:'text-blue-400'},
          ].map(m=>(
            <div key={m.metric} className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <div className={`text-sm font-bold ${m.color} sm:w-52 flex-shrink-0`}>{m.metric}</div>
              <div className="text-slate-400 text-sm">{m.meaning}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SYSTEM PIPELINE — CV LENS */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6"><ArrowRight className="text-green-400"/>System Pipeline (CV Lens)</h2>
        <div className="flex flex-wrap items-center gap-3 justify-center text-xs font-mono">
          {[
            {label:'OpenCV Capture',c:'border-blue-500/50 bg-blue-500/10 text-blue-300'},
            null,
            {label:'Circular Buffer',c:'border-slate-600 bg-slate-700 text-slate-300'},
            null,
            {label:'Uniform Sampling',c:'border-slate-600 bg-slate-700 text-slate-300'},
            null,
            {label:'Spatial Normalization',c:'border-teal-500/50 bg-teal-500/10 text-teal-300'},
            null,
            {label:'3D Conv Features',c:'border-purple-500/50 bg-purple-500/10 text-purple-300'},
            null,
            {label:'Softmax Decision',c:'border-slate-600 bg-slate-700 text-slate-300'},
            null,
            {label:'Threshold Alert',c:'border-red-500/50 bg-red-500/10 text-red-400 font-bold'},
          ].map((item,i)=> item===null
            ? <ArrowRight key={i} size={16} className="text-slate-600 flex-shrink-0"/>
            : <div key={i} className={`px-4 py-3 rounded-xl border ${item.c} text-center`}>{item.label}</div>
          )}
        </div>
      </div>

    </div>
  );
}
