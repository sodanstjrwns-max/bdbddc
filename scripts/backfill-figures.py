import urllib.request, json, sys, time
S = open('/home/user/gsc-work/cron_secret_prod.txt').read().strip()
N = int(sys.argv[1]); done=[]; fail=[]
for i in range(N):
    ok=False
    for attempt in range(3):
        try:
            r=urllib.request.Request('https://bdbddc.com/api/cron/figure?patch=1',
                method='POST', headers={'X-Cron-Secret':S,'User-Agent':'M'})
            d=json.load(urllib.request.urlopen(r, timeout=120))
        except Exception as e:
            print('  ! http', type(e).__name__, e); time.sleep(2); continue
        if d.get('done'): print('ALL DONE'); print('OK',len(done),'FAIL',len(fail)); sys.exit(0)
        if d.get('ok') and d.get('patched'):
            print('%2d/%d ok %-52s %s'%(i+1,N,d['slug'],d['url'].split('?v=')[-1])); done.append(d['slug']); ok=True; break
        print('  ! retry', d.get('error') or d); time.sleep(2)
    if not ok: fail.append(i); print('%2d/%d FAILED after 3 tries'%(i+1,N))
print('---'); print('OK',len(done),'FAIL',len(fail))
