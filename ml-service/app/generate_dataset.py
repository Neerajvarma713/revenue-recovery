from pathlib import Path
import csv, random
random.seed(42)
out = Path(__file__).resolve().parents[1] / "data"
out.mkdir(exist_ok=True)
path = out / "customers.csv"
rows=[]
for i in range(1,3001):
    tenure=random.randint(1,60); revenue=round(random.uniform(30,900),2); tickets=random.poisson(2) if hasattr(random,'poisson') else random.randint(0,7)
    failures=random.choices([0,1,2,3],[.72,.18,.08,.02])[0]; usage=round(random.uniform(-65,40),1); nps=random.randint(-20,90); days=random.randint(0,90); discount=random.randint(0,40)
    churn=(failures>=2 or usage<-30 or days>35 or nps<10 or (tickets>=6 and tenure<12))
    rows.append([i,f"Customer {i}",tenure,revenue,tickets,failures,usage,nps,random.choice(['basic','standard','premium']),days,discount,int(churn)])
# named demo customers
rows[:5]=[
["rahul-sharma","Rahul Sharma",8,420,8,2,-48,2,"premium",46,10,1],
["maya-patel","Maya Patel",38,1250,1,0,4,72,"premium",2,35,0],
["arjun-reddy","Arjun Reddy",14,210,5,1,-22,24,"standard",18,15,1],
["sara-khan","Sara Khan",55,680,0,0,15,81,"premium",1,5,0],
["viktor-lee","Viktor Lee",5,95,7,1,-38,12,"basic",41,25,1],]
with path.open('w',newline='',encoding='utf-8') as f:
    w=csv.writer(f); w.writerow(['id','name','tenure_months','monthly_revenue','support_tickets_90d','payment_failures_90d','usage_change_pct','nps','plan_type','days_since_login','discount_pct','churned']); w.writerows(rows)
print(path)
