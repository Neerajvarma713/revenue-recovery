export function revenueAtRisk(c){return Math.max(0,Number(c.monthlyRevenue||0)*12*Number(c.churnProbability||0));}
export function explain(c){const reasons=[]; if(c.paymentFailures90d>=2) reasons.push('repeated payment failures'); if(c.usageChangePct<=-20) reasons.push('usage decline'); if(c.daysSinceLogin>30) reasons.push('long inactivity'); if(c.supportTickets90d>=5) reasons.push('elevated support demand'); if(c.nps<20) reasons.push('low customer sentiment'); return reasons.length?reasons:['limited negative signals'];}
export function strategies(c){const base=Number(c.monthlyRevenue||0); return [
{name:'Concierge outreach',cost:25,retention:.18},
{name:'Targeted credit',cost:Math.min(base*.08,75),retention:.24},
{name:'Plan adjustment',cost:Math.min(base*.05,45),retention:.16},
{name:'Payment recovery',cost:10,retention:.21}].map(x=>({...x,expectedRevenue:base*12*x.retention,netValue:base*12*x.retention-x.cost}));}
