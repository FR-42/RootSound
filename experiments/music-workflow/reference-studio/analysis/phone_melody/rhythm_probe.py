"""Estimate a timing grid from onset evidence without quantizing audio or notes."""
from pathlib import Path
import json
import numpy as np
from scipy import optimize

CASE=Path(__file__).resolve().parents[2]/'cases/phone-recording-20261023-233819'
prior=json.loads((CASE/'instrument/pitch-analysis/initial-probe.json').read_text('utf-8'))
onsets=np.asarray(prior['onsets'])
best=None
for period in np.linspace(.076,.079,1201):
    phase=np.angle(np.mean(np.exp(2j*np.pi*onsets/period)))*period/(2*np.pi)
    residual=(onsets-phase+period/2)%period-period/2
    score=np.mean(np.exp(-.5*(residual/.006)**2))
    if best is None or score>best[0]: best=(score,period,phase)
score,period,phase=best
indexes=np.round((onsets-phase)/period)
fit=optimize.least_squares(lambda p:onsets-(p[0]+indexes*p[1]),[phase,period],
                           loss='soft_l1',f_scale=.006)
phase,period=map(float,fit.x)
residual=onsets-(phase+indexes*period)
report={'source':prior['source'],'sourceSha256':prior['sha256'],
    'estimatedSixteenthSeconds':period,'estimatedQuarterBpm':60/(4*period),
    'gridPhaseSeconds':phase,'softInlierScore':float(score),
    'within10msCount':int(np.count_nonzero(abs(residual)<.010)),
    'onsetCount':len(onsets),'medianAbsoluteResidualMs':float(np.median(abs(residual))*1000),
    'onsets':onsets.tolist(),'residualMs':(residual*1000).tolist(),
    'limitations':['Onsets include accompaniment and percussion, not just lead.',
                  'Grid estimate does not establish a bar downbeat or author tempo.',
                  'Note-specific attacks must be checked; no note quantization applied here.']}
out=CASE/'melody'
out.mkdir(parents=True,exist_ok=True)
(out/'rhythm-evidence.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k not in ('onsets','residualMs','limitations','source')}))
