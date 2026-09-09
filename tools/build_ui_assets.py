"""Build original vector UI assets. Run explicitly; overwrites this kit's files."""
from pathlib import Path
import json
import html
import math

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/images/ui'
INK = '#234B50'
TEAL = '#237D79'
entries = {}
previews = []

def save(group, name, width, height, body, inset=None):
    key = f'ui.{group}.{name}'
    path = OUT / group / f'{name}.svg'
    path.parent.mkdir(parents=True, exist_ok=True)
    aspect = ' preserveAspectRatio="none"' if group == 'buttons' else ''
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}"{aspect} fill="none"><title>{html.escape(name)}</title>{body}</svg>'
    path.write_text(svg, encoding='utf-8')
    entry = {'type': 'image', 'path': path.relative_to(ROOT).as_posix(), 'pngPath': path.with_suffix('.png').relative_to(ROOT).as_posix(), 'logicalSize': [width,height], 'pngScale': 2}
    if inset:
        entry['nineSliceInsetsLogical'] = inset
    entries[key] = entry
    previews.append((group, name, width, height, body))

def rect(x,y,w,h,r,fill,stroke=None,sw=2):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"' + (f' stroke="{stroke}" stroke-width="{sw}"' if stroke else '') + '/>'

def line(path, color=INK, width=4):
    return f'<path d="{path}" stroke="{color}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>'

icons = {
 'play': '<path d="M25 17L47 32L25 47Z" fill="currentColor"/>',
 'pause': '<rect x="20" y="17" width="8" height="30" rx="3" fill="currentColor"/><rect x="36" y="17" width="8" height="30" rx="3" fill="currentColor"/>',
 'home': line('M12 30L32 13L52 30M18 27V50H46V27M27 50V36H37V50','currentColor'),
 'back': line('M38 16L22 32L38 48M23 32H51','currentColor'),
 'next': line('M26 16L42 32L26 48M41 32H13','currentColor'),
 'close': line('M20 20L44 44M44 20L20 44','currentColor'),
 'check': line('M15 33L27 45L49 20','currentColor',5),
 'retry': line('M15 26A19 19 0 1 1 16 42M15 15V27H27','currentColor'),
 'hint': line('M24 43C24 36 18 35 18 26A14 14 0 0 1 46 26C46 35 40 36 40 43ZM26 49H38M29 55H35M32 3V6M8 12L12 16M52 16L56 12','currentColor'),
 'preview': line('M7 32C20 12 44 12 57 32C44 52 20 52 7 32Z','currentColor') + '<circle cx="32" cy="32" r="8" stroke="currentColor" stroke-width="4"/>',
 'timer': '<circle cx="32" cy="35" r="19" stroke="currentColor" stroke-width="4"/>' + line('M26 6H38M32 6V15M47 17L51 13M32 24V35L40 40','currentColor'),
 'infinity': line('M32 32C18 11 7 21 9 33C11 47 24 45 32 32C40 19 53 17 55 31C57 43 46 53 32 32','currentColor'),
 'sound-on': line('M11 26H21L34 15V49L21 38H11ZM42 25Q50 32 42 39M48 18Q62 32 48 46','currentColor'),
 'sound-off': line('M11 26H21L34 15V49L21 38H11ZM43 25L55 39M55 25L43 39','currentColor'),
 'lock': rect(17,28,30,25,7,'none','currentColor',4) + line('M23 28V20A9 9 0 0 1 41 20V28M32 38V43','currentColor'),
 'drag': line('M24 34V15A4 4 0 0 1 32 15V29M32 24A4 4 0 0 1 40 24V30M40 27A4 4 0 0 1 48 27V33M48 32A4 4 0 0 1 56 32V42Q56 54 43 55H35Q30 55 26 50L14 37Q10 30 16 29Q20 29 24 34Z','currentColor',3.5),
 'camera': line('M10 23H21L25 16H39L43 23H54V49H10Z','currentColor') + '<circle cx="32" cy="35" r="8" stroke="currentColor" stroke-width="4"/>',
 'help': '<circle cx="32" cy="32" r="23" stroke="currentColor" stroke-width="4"/>' + line('M24 24C24 15 41 15 41 25C41 32 32 31 32 38','currentColor') + '<circle cx="32" cy="46" r="2.5" fill="currentColor"/>',
 'bedroom': line('M10 48V24M54 48V31M10 42H54M10 31H54V42M16 31V23H29V31M33 31V23H46V31','currentColor'),
 'living-room': line('M15 29V23Q15 17 22 17H42Q49 17 49 23V29M10 43V31Q10 26 16 29L20 33H44L48 29Q54 26 54 31V43ZM17 43V49M47 43V49','currentColor'),
 'study-room': line('M10 31H54M16 31V51M48 31V51M26 31V15H47V31M33 21H41M20 21L12 13M12 13H22M12 13V23','currentColor'),
}
for name, body in icons.items():
    save('icons', name,64,64, f'<g color="{INK}">{body}</g>')

for style, colors in {
 'primary': ('#237D79','#338F87','#1B6765','#145354'),
 'secondary': ('#FFFCF4','#FFFFFF','#F1E7D4','#DED3BC'),
 'accent': ('#FFD36B','#FFDE8E','#E8B74B','#B98B32'),
}.items():
    normal,hover,pressed,base = colors
    for state, fill in [('normal',normal),('hover',hover),('pressed',pressed)]:
        y=9 if state=='pressed' else 3
        body=rect(4,11,312,64,23,base)+rect(4,y,312,64,23,fill)
        if state!='pressed': body+=line('M30 10H288', '#FFFFFF',2).replace('/>',' opacity="0.22"/>')
        save('buttons',f'{style}-{state}',320,80,body,[28,30,28,30])
save('buttons','disabled',320,80,rect(4,9,312,64,23,'#C8CECA')+rect(4,3,312,64,23,'#E0E5DF'),[28,30,28,30])
for state,fill,base in [('normal','#FFFCF4','#DED3BC'),('hover','#E0F3E9','#BDDBCD'),('pressed','#CBEBDE','#ACD3C4'),('disabled','#E0E5DF','#C8CECA')]:
    save('buttons',f'icon-{state}',80,80,rect(4,10,72,66,23,base)+rect(4,8 if state=='pressed' else 3,72,66,23,fill),[28,28,28,28])

for name,w,h,fill,border in [
 ('catalog',300,760,'#FFFCF4','#E6DBC7'),('modal',640,480,'#FFFCF4','#E6DBC7'),
 ('hud',760,104,'#FFFCF4','#E6DBC7'),('tooltip',360,104,'#234B50','#234B50'),
 ('card-normal',240,200,'#FFFFFF','#E5DFD1'),('card-selected',240,200,'#E9F7F0','#237D79'),
 ('card-complete',240,200,'#DEF2E3','#43865C'),('card-disabled',240,200,'#EEF0EA','#D4D9D1'),
 ('room-card',360,300,'#FFFCF4','#E6DBC7')]:
    save('panels',name,w,h,rect(4,10,w-8,h-14,26,'#D5C9B4')+rect(4,4,w-8,h-16,26,fill,border,3),[34,34,34,34])

def star(cx,cy,outer,inner):
    pts=[]
    for i in range(10):
        angle=math.radians(-90+i*36); r=outer if i%2==0 else inner
        pts.append(f'{cx+math.cos(angle)*r:.2f},{cy+math.sin(angle)*r:.2f}')
    return ' '.join(pts)
for name,fill,stroke in [('star-filled','#FFD36B','#B3832B'),('star-empty','#E7E6DC','#A6B4AB')]:
    body=f'<polygon points="{star(64,68,50,26)}" fill="{stroke}" stroke="{stroke}" stroke-width="6" stroke-linejoin="round"/><polygon points="{star(64,61,50,26)}" fill="{fill}" stroke="{stroke}" stroke-width="3" stroke-linejoin="round"/>'
    if name=='star-filled': body+=line('M53 41L64 21L70 35','#FFF4C4',5)
    save('rewards',name,128,128,body)
for name,fill,glyph in [('complete','#43865C','check'),('locked','#81978C','lock')]:
    save('badges',name,64,64,f'<circle cx="32" cy="32" r="29" fill="{fill}" stroke="#FFFCF4" stroke-width="4"/><g color="#FFFFFF" transform="translate(10 10) scale(.6875)">{icons[glyph]}</g>')
for name,fill in [('easy','#D9F0E2'),('medium','#FFEDB8'),('hard','#EDDCF2')]:
    save('badges',name,160,56,rect(2,2,156,52,24,fill),[26,26,26,26])
save('progress','track',360,28,rect(2,2,356,24,12,'#E4E7DD'),[14,14,14,14])
save('progress','fill',360,28,rect(2,2,356,24,12,'#43865C')+rect(10,6,340,5,2.5,'#76AF81'),[14,14,14,14])
save('progress','timer-idle',180,64,rect(2,2,176,60,22,'#E0F0EC'),[24,24,24,24])
save('progress','timer-low',180,64,rect(2,2,176,60,22,'#FFE6C8'),[24,24,24,24])
save('effects','sparkle',128,128,'<path d="M64 10Q68 56 114 64Q68 68 64 114Q56 68 10 64Q56 56 64 10Z" fill="#FFD36B"/><path d="M102 10Q103 25 119 28Q103 30 102 46Q99 30 84 28Q99 25 102 10Z" fill="#69B6A4"/>')
save('effects','target-neutral',256,128,'<ellipse cx="128" cy="64" rx="116" ry="49" fill="#237D79" fill-opacity=".10" stroke="#237D79" stroke-width="4" stroke-dasharray="10 9"/>')
save('effects','target-valid',256,128,'<ellipse cx="128" cy="64" rx="116" ry="49" fill="#66B97E" fill-opacity=".22" stroke="#43865C" stroke-width="5"/><g color="#43865C" transform="translate(96 32)">'+icons['check']+'</g>')
confetti=''
for i,(x,y) in enumerate([(30,35),(85,18),(142,48),(205,20),(265,40),(322,17),(370,60),(53,110),(160,125),(280,110),(348,139),(115,165),(225,175)]):
    color=['#FFD36B','#69B6A4','#D3A5D5','#F2A67F'][i%4]
    confetti+=f'<rect x="{x}" y="{y}" width="9" height="18" rx="3" fill="{color}" transform="rotate({i*29} {x} {y})"/>'
save('effects','confetti',400,210,confetti)

tokens={
 'schemaVersion':1,'name':'Ruang Ceria','colors':{'background':'#F6F0E3','surface':'#FFFCF4','text':INK,'primary':TEAL,'onPrimary':'#FFFFFF','accent':'#FFD36B','success':'#43865C','muted':'#60786F'},
 'typography':{'preferredFamily':'Nunito','fallback':['Segoe UI','Arial','sans-serif'],'fontBundled':False,'titleSize':40,'bodySize':20,'buttonSize':22,'smallSize':16},
 'touch':{'minimumTarget':64,'recommendedTarget':80,'gap':12},
 'layout':{'referenceSize':[1440,900],'catalogWidth':300,'safeMargin':24},
 'motion':{'buttonMilliseconds':120,'snapMilliseconds':180,'sparkleMilliseconds':450,'respectReducedMotion':True},
 'textColors':{'primaryButton':'#FFFFFF','secondaryButton':INK,'accentButton':INK,'disabledButton':'#60786F','tooltip':'#FFFFFF'},
 'notes':['Logical units follow SVG viewBox. PNGs export at 2x.','All labels are rendered separately by the application.']}
(ROOT/'config/ui-theme.json').write_text(json.dumps(tokens,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
(ROOT/'config/ui-assets.json').write_text(json.dumps({'schemaVersion':1,'pathBase':'project-root','assets':entries},indent=2)+'\n',encoding='utf-8')

# Static visual catalogue: no game logic, dependencies, or server.
W=1440; H=230+math.ceil(len(previews)/6)*190+70
sheet=f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><rect width="{W}" height="{H}" fill="#F6F0E3"/><g font-family="Segoe UI,Arial,sans-serif" fill="{INK}"><text x="48" y="60" font-size="16" letter-spacing="3">AYO LENGKAPI RUANGAN!</text><text x="48" y="116" font-size="44" font-weight="700">Ruang Ceria · UI asset kit</text><text x="48" y="154" font-size="20">Tombol, panel, ikon, dan hadiah · SVG + PNG transparan · versi 01</text>'
for i,(group,name,w,h,body) in enumerate(previews):
    x=48+(i%6)*226;y=205+(i//6)*190
    sheet+=rect(x,y,210,176,16,'#FFFFFF')
    scale=min(178/w,115/h,1.2);dw=w*scale;dh=h*scale
    sheet+=f'<svg x="{x+(210-dw)/2}" y="{y+12+(115-dh)/2}" width="{dw}" height="{dh}" viewBox="0 0 {w} {h}" fill="none">{body}</svg><text x="{x+12}" y="{y+147}" font-size="13" font-weight="600">{name}</text><text x="{x+12}" y="{y+166}" font-size="11" fill="#60786F">{group} · {w} × {h}</text>'
sheet+='</g></svg>'
preview_dir=ROOT/'docs/ui';preview_dir.mkdir(parents=True,exist_ok=True)
(preview_dir/'asset-overview.svg').write_text(sheet,encoding='utf-8')
print(f'Created {len(entries)} SVG assets, theme, manifest, and overview.')

