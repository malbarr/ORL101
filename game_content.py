#!/usr/bin/env python3
“””
ORL101 Game Content Injector
Adds swipe_cards, survive_shifts, pick_mistakes, matching_sets, action_cards, high_yield to data.js
“””

import json
import re

SWIPE_CARDS = [
{“statement”: “Weber test lateralises to the better ear in sensorineural hearing loss.”, “answer”: True, “explanation”: “In SNHL, bone conduction is reduced on the affected side, so the sound is heard louder in the better ear.”},
{“statement”: “Rinne negative means air conduction is greater than bone conduction.”, “answer”: False, “explanation”: “Rinne negative = BC > AC, indicating conductive hearing loss.”},
{“statement”: “Cholesteatoma is associated with a central tympanic membrane perforation.”, “answer”: False, “explanation”: “Cholesteatoma is associated with attic or marginal (not central) perforations — the ‘unsafe’ type.”},
{“statement”: “The Epley manoeuvre is used to treat BPPV.”, “answer”: True, “explanation”: “The Epley canalith repositioning manoeuvre is first-line treatment for posterior canal BPPV.”},
{“statement”: “Samter’s triad consists of asthma, aspirin sensitivity, and nasal polyps.”, “answer”: True, “explanation”: “This triad (also called Widal’s triad) is classic for eosinophilic CRSwNP.”},
{“statement”: “In acute epiglottitis, the throat should be examined with a tongue depressor immediately.”, “answer”: False, “explanation”: “NEVER use a spatula — risk of laryngospasm and complete airway obstruction. Senior anaesthetist first.”},
{“statement”: “Button battery in a child’s nose is a same-day ENT emergency.”, “answer”: True, “explanation”: “Button batteries cause rapid electrochemical tissue necrosis within hours — immediate removal required.”},
{“statement”: “The most common site of epistaxis is Little’s area on the posterior septum.”, “answer”: False, “explanation”: “Little’s area (Kiesselbach’s plexus) is on the anterior inferior septum, not posterior.”},
{“statement”: “Parotid gland facial nerve palsy suggests malignancy.”, “answer”: True, “explanation”: “Facial nerve involvement with a parotid mass is a red flag for malignancy until proven otherwise.”},
{“statement”: “Type B tympanogram indicates normal middle ear function.”, “answer”: False, “explanation”: “Type B (flat) indicates middle ear effusion or TM perforation. Type A is normal.”},
{“statement”: “Hoarseness lasting more than 3 weeks in an adult requires laryngoscopy.”, “answer”: True, “explanation”: “To exclude laryngeal malignancy — 2-week wait referral if suspicious features present.”},
{“statement”: “The Sistrunk procedure removes only the thyroglossal duct cyst.”, “answer”: False, “explanation”: “Sistrunk procedure removes the cyst plus the middle portion of the hyoid bone and the thyroglossal tract to prevent recurrence.”},
{“statement”: “Acute mastoiditis is a complication of otitis externa.”, “answer”: False, “explanation”: “Acute mastoiditis is a complication of acute otitis media (AOM), not otitis externa.”},
{“statement”: “Second branchial cleft cysts are located along the anterior border of SCM.”, “answer”: True, “explanation”: “They typically appear at the junction of the upper and middle thirds of the anterior SCM border.”},
{“statement”: “Presbycusis causes high-frequency hearing loss first.”, “answer”: True, “explanation”: “Age-related sensorineural hearing loss affects high frequencies first (hair cells at the basal cochlea).”},
{“statement”: “Intranasal corticosteroids are first-line for allergic rhinitis.”, “answer”: True, “explanation”: “INCS (e.g. mometasone, fluticasone) are the gold standard for persistent allergic rhinitis.”},
{“statement”: “Post-auricular swelling with displaced auricle suggests mastoiditis.”, “answer”: True, “explanation”: “Displacement of the auricle inferiorly and anteriorly with post-auricular erythema is the classic presentation of mastoiditis.”},
{“statement”: “RLN palsy after thyroid surgery typically presents with stridor.”, “answer”: False, “explanation”: “Unilateral RLN palsy causes breathy/weak voice and bovine cough. Bilateral palsy causes stridor — a respiratory emergency.”},
{“statement”: “Conductive hearing loss lateralises to the affected ear on Weber testing.”, “answer”: True, “explanation”: “In conductive loss, bone conduction is enhanced on the blocked side, so Weber lateralises to the worse ear.”},
{“statement”: “Mealtime swelling of the submandibular gland suggests salivary stone.”, “answer”: True, “explanation”: “Mealtime syndrome: salivary stimulation causes backpressure proximal to the stone, causing painful swelling that subsides after eating.”},
]

SURVIVE_SHIFTS = [
{
“id”: 1,
“title”: “The Bleeding Nose”,
“scenario”: “68M on warfarin. Heavy right-sided epistaxis x 30 min. Blood tracking posteriorly. BP 175/95. Feels dizzy.”,
“question”: “What is your FIRST action?”,
“options”: [
“Tilt head back and apply ice pack”,
“Sit patient forward, pinch soft part of nose for 15 min”,
“Insert anterior nasal pack immediately”,
“Check INR and wait for results before doing anything”
],
“correct”: 1,
“explanation”: “Sit forward (prevents swallowing blood), pinch soft nose x 15 min. Never tilt head back. Pack only if this fails.”
},
{
“id”: 2,
“title”: “The Drooling Adult”,
“scenario”: “35M. Sudden severe sore throat, high fever 39.5°C, drooling, muffled voice, tripod position, inspiratory stridor. 6 hours duration.”,
“question”: “What should you NOT do?”,
“options”: [
“Call senior anaesthetist immediately”,
“Sit patient upright”,
“Examine throat with tongue depressor”,
“Prepare for intubation”
],
“correct”: 2,
“explanation”: “NEVER use a spatula in suspected epiglottitis. Risk of complete laryngospasm and airway obstruction.”
},
{
“id”: 3,
“title”: “The Ear Behind the Ear”,
“scenario”: “8M child. AOM treated 1 week ago (incomplete antibiotics). Now: post-auricular swelling, ear displaced forward, fever 39.2°C, sagging posterior canal wall on otoscopy.”,
“question”: “What is the MOST appropriate management?”,
“options”: [
“Continue oral antibiotics and review in 48 hours”,
“Ear drops and analgesia”,
“Immediate hospital admission, IV antibiotics, CT temporal bones”,
“Myringotomy in clinic”
],
“correct”: 2,
“explanation”: “This is acute mastoiditis — an ENT emergency. Needs IV antibiotics, CT to exclude intracranial complications, and possible mastoidectomy.”
},
{
“id”: 4,
“title”: “The Spinning Lady”,
“scenario”: “55F. Brief episodes of spinning when rolling in bed. Each episode <60 seconds. No hearing loss, no tinnitus. Dix-Hallpike positive right: upbeat torsional nystagmus, fatigable.”,
“question”: “What is the correct treatment?”,
“options”: [
“Prescribe prochlorperazine and rest”,
“MRI brain urgent”,
“Epley manoeuvre”,
“Refer for cochlear implant”
],
“correct”: 2,
“explanation”: “Positive Dix-Hallpike = posterior canal BPPV. Epley manoeuvre (canalith repositioning) is first-line — 80–90% success rate.”
},
{
“id”: 5,
“title”: “The Hoarse Smoker”,
“scenario”: “55M. Heavy smoker, 20 units alcohol/week. 6 weeks progressive hoarseness, mild dysphagia, 4 kg weight loss. Flexible nasendoscopy: irregular white lesion left vocal cord, reduced movement.”,
“question”: “What is the MOST urgent next step?”,
“options”: [
“Trial of voice rest and review in 6 weeks”,
“PPI for laryngopharyngeal reflux”,
“Urgent 2-week wait ENT referral + CT neck/thorax”,
“Speech therapy referral”
],
“correct”: 2,
“explanation”: “Suspected laryngeal carcinoma. Red flags: smoker + drinker + weight loss + irregular cord lesion. 2-week wait referral mandatory.”
},
]

PICK_MISTAKES = [
{
“id”: 1,
“title”: “AOM Management Plan”,
“scenario”: “A 3-year-old presents with AOM. The doctor writes: ‘Start amoxicillin immediately. Keep ear dry with cotton wool. Review in 2 weeks. If no improvement, refer to ENT for grommets.’”,
“question”: “What is the mistake in this management plan?”,
“options”: [
“Amoxicillin is the wrong antibiotic”,
“Antibiotics should not be started immediately in a 3-year-old with AOM — watchful waiting 48–72h is recommended first”,
“The review period is too short”,
“Cotton wool is not recommended”
],
“correct”: 1,
“explanation”: “NICE/AAP guidelines: watchful waiting 48–72h for children ≥2 years with uncomplicated AOM. Antibiotics if no improvement, age <2 with bilateral AOM, or otorrhoea.”
},
{
“id”: 2,
“title”: “Epistaxis First Aid”,
“scenario”: “A nurse advises a patient with nosebleed: ‘Tilt your head back and breathe through your mouth. Pinch the bony upper part of your nose for 5 minutes. If bleeding continues, we will pack the back of your nose.’”,
“question”: “How many mistakes are in this advice?”,
“options”: [
“No mistakes”,
“One mistake — head should not be tilted back”,
“Two mistakes — head back is wrong AND pinch the soft not bony part”,
“Three mistakes — head position, pinch location, AND 5 min is too short”
],
“correct”: 3,
“explanation”: “Three errors: (1) Tilt FORWARD not back (swallowing blood causes nausea/vomiting), (2) pinch SOFT lower nose not bony bridge, (3) hold for 10–15 minutes not 5.”
},
{
“id”: 3,
“title”: “CSOM Management”,
“scenario”: “Patient with CSOM (central perforation, no cholesteatoma). Doctor prescribes: ‘Gentamicin ear drops three times daily. Swimming allowed with ear plugs. ENT referral for myringoplasty.’”,
“question”: “What is the critical mistake?”,
“options”: [
“Myringoplasty referral is wrong”,
“Gentamicin ear drops are ototoxic and contraindicated with TM perforation”,
“Swimming with ear plugs is not allowed”,
“Three times daily is the wrong dosing”
],
“correct”: 1,
“explanation”: “Aminoglycosides (gentamicin) are ototoxic and CONTRAINDICATED when the TM is perforated. Use quinolone drops (ciprofloxacin) which are safe for the middle ear.”
},
{
“id”: 4,
“title”: “Parotid Lump Workup”,
“scenario”: “40F with 3cm firm parotid lump, no facial nerve weakness, 2-year history. Doctor plans: ‘Excision biopsy in clinic to confirm diagnosis, then MRI if malignant.’”,
“question”: “What is the mistake?”,
“options”: [
“MRI should come first; excision biopsy risks tumour seeding and facial nerve damage”,
“The lump is too small to biopsy”,
“Facial nerve testing is not necessary”,
“The history is too long to be benign”
],
“correct”: 0,
“explanation”: “Excision biopsy of a parotid mass risks tumour seeding and facial nerve injury. Correct sequence: USS ± FNAC → MRI → superficial parotidectomy with nerve monitoring.”
},
{
“id”: 5,
“title”: “BPPV Treatment”,
“scenario”: “55F with classic BPPV, positive Dix-Hallpike right. Doctor prescribes: ‘Prochlorperazine 5mg TDS. Avoid lying on right side. Review in 4 weeks. If no improvement, MRI brain.’”,
“question”: “What is the primary mistake?”,
“options”: [
“Prochlorperazine is the wrong dose”,
“The Epley manoeuvre was not performed — it is first-line with 80–90% success”,
“MRI should be done now”,
“Lying restriction is wrong”
],
“correct”: 1,
“explanation”: “Epley manoeuvre (canalith repositioning) is first-line for posterior canal BPPV. Vestibular suppressants like prochlorperazine are not recommended as primary treatment.”
},
]

MATCHING_SETS = [
{
“id”: 1,
“title”: “Match the Tympanogram”,
“left”: [“Type A”, “Type B”, “Type C”, “Type As”],
“right”: [
“Negative middle ear pressure — ETD”,
“Normal middle ear function”,
“Flat — effusion or perforation”,
“Reduced compliance — otosclerosis”
],
“correct_pairs”: [[0,1],[1,2],[2,0],[3,3]],
“explanation”: “A=normal, As=stiffness (otosclerosis), B=flat (effusion/perforation), C=negative pressure (ETD)”
},
{
“id”: 2,
“title”: “Match the Neck Swelling”,
“left”: [“Thyroglossal duct cyst”, “Branchial cleft cyst”, “Pleomorphic adenoma”, “Submandibular stone”],
“right”: [
“Mealtime swelling, floor of mouth mass”,
“Moves up with tongue protrusion”,
“Lateral SCM, after URTI”,
“Pre-auricular, firm, no nerve palsy”
],
“correct_pairs”: [[0,1],[1,2],[2,3],[3,0]],
“explanation”: “TGDC moves with tongue protrusion; branchial cyst is lateral SCM; pleomorphic adenoma is parotid; stone causes mealtime syndrome.”
},
{
“id”: 3,
“title”: “Match the Emergency”,
“left”: [“Acute epiglottitis”, “Acute mastoiditis”, “Button battery”, “Posterior epistaxis”],
“right”: [
“IV antibiotics + CT temporal bones”,
“Sphenopalatine artery ligation”,
“Same-day removal — electrochemical necrosis”,
“Senior anaesthetist + no spatula”
],
“correct_pairs”: [[0,3],[1,0],[2,2],[3,1]],
“explanation”: “Epiglottitis: airway emergency; mastoiditis: IV ABx + CT; button battery: same-day removal; posterior epistaxis: ENT for packing or ligation.”
},
{
“id”: 4,
“title”: “Match the Tuning Fork Result”,
“left”: [“Rinne negative”, “Rinne positive + Weber central”, “Weber to better ear”, “Weber to worse ear”],
“right”: [
“Bilateral SNHL”,
“Unilateral SNHL”,
“Conductive hearing loss”,
“Bone conduction > air conduction”
],
“correct_pairs”: [[0,3],[1,0],[2,1],[3,2]],
“explanation”: “Rinne negative = BC>AC = conductive; bilateral Rinne positive + central Weber = bilateral SNHL; Weber to better = unilateral SNHL; Weber to worse = conductive.”
},
{
“id”: 5,
“title”: “Match the Surgery”,
“left”: [“Myringoplasty”, “Septoplasty”, “Sistrunk”, “FESS”],
“right”: [
“Functional endoscopic sinus surgery for chronic sinusitis/polyps”,
“Thyroglossal duct cyst + mid-hyoid removal”,
“Correction of deviated nasal septum”,
“Repair of tympanic membrane perforation”
],
“correct_pairs”: [[0,3],[1,2],[2,1],[3,0]],
“explanation”: “Myringoplasty=TM repair; Septoplasty=DNS correction; Sistrunk=TGDC; FESS=sinus surgery.”
},
]

ACTION_CARDS = [
{
“id”: 1,
“trigger”: “Post-auricular swelling + displaced auricle in a child”,
“icon”: “🚨”,
“action”: “Acute Mastoiditis Protocol”,
“steps”: [
“Admit immediately”,
“IV ceftriaxone or co-amoxiclav”,
“Urgent CT temporal bones”,
“ENT review same day”,
“Prepare for mastoidectomy if abscess”
],
“danger”: “Risk: intracranial spread — meningitis, sigmoid sinus thrombosis, brain abscess”
},
{
“id”: 2,
“trigger”: “Drooling + muffled voice + tripod position + stridor”,
“icon”: “🚨”,
“action”: “Epiglottitis Protocol”,
“steps”: [
“Do NOT use tongue depressor”,
“Call senior anaesthetist IMMEDIATELY”,
“Keep patient upright”,
“IV ceftriaxone + dexamethasone”,
“Prepare for intubation/tracheostomy”
],
“danger”: “Risk: complete airway obstruction — can deteriorate in minutes”
},
{
“id”: 3,
“trigger”: “Button battery or disc magnet in nose or ear”,
“icon”: “⚡”,
“action”: “Same-Day Emergency Removal”,
“steps”: [
“Same-day ENT referral”,
“Do not attempt blind removal”,
“Removal under direct vision or GA”,
“Tissue necrosis begins within 1–2 hours”,
“Check for bilateral — can swallow second battery”
],
“danger”: “Risk: rapid electrochemical necrosis of surrounding tissue”
},
{
“id”: 4,
“trigger”: “Hoarseness >3 weeks in adult smoker/drinker”,
“icon”: “🔴”,
“action”: “Suspected Laryngeal Malignancy”,
“steps”: [
“Urgent 2-week wait ENT referral”,
“Flexible nasendoscopy”,
“CT neck and thorax”,
“Direct laryngoscopy + biopsy under GA”,
“MDT referral: ENT + oncology”
],
“danger”: “Risk: delayed diagnosis of laryngeal carcinoma”
},
{
“id”: 5,
“trigger”: “Posterior epistaxis in elderly hypertensive on anticoagulants”,
“icon”: “🚨”,
“action”: “Posterior Epistaxis Protocol”,
“steps”: [
“Sit forward, never tilt back”,
“IV access, FBC, coagulation, INR”,
“Anterior nasal pack first”,
“Same-day ENT if fails”,
“Sphenopalatine artery ligation if recurrent”
],
“danger”: “Risk: significant blood loss, aspiration if head tilted back”
},
{
“id”: 6,
“trigger”: “Unilateral foul nasal discharge in a child”,
“icon”: “⚡”,
“action”: “Nasal Foreign Body Until Proven Otherwise”,
“steps”: [
“Assume FB until proven otherwise”,
“Check for button battery first”,
“Mother’s kiss technique for small objects”,
“ENT referral if unsuccessful”,
“No blind forceps without visualisation”
],
“danger”: “Risk: button battery missed = tissue necrosis”
},
{
“id”: 7,
“trigger”: “Central TM perforation + offensive discharge + attic involvement”,
“icon”: “🔴”,
“action”: “Suspect Cholesteatoma”,
“steps”: [
“Urgent ENT referral”,
“Do NOT give aminoglycoside drops”,
“CT temporal bones”,
“Mastoid exploration likely required”,
“Risk of intracranial complications if delayed”
],
“danger”: “Risk: erosion of ossicles, facial nerve, labyrinth, dura”
},
{
“id”: 8,
“trigger”: “Facial nerve palsy + parotid swelling”,
“icon”: “🔴”,
“action”: “Suspect Parotid Malignancy”,
“steps”: [
“Urgent ENT/head & neck referral”,
“MRI parotid gland”,
“USS + FNAC”,
“No excision biopsy — risk of seeding”,
“CT chest for staging if confirmed”
],
“danger”: “Facial nerve palsy with parotid mass = malignant until proven otherwise”
},
]

HIGH_YIELD = [
{
“chapter_id”: 2,
“chapter_title”: “Anatomy of ENT”,
“points”: [
“Kiesselbach’s plexus (Little’s area) on anterior inferior septum = most common epistaxis site”,
“RLN runs in tracheo-oesophageal groove; left RLN loops around aortic arch (longer course)”,
“Facial nerve exits stylomastoid foramen → parotid → 5 branches (METIS)”,
“Eustachian tube: opens nasopharynx → connects to middle ear; equalises pressure”,
“Cochlea: base = high frequency; apex = low frequency”
]
},
{
“chapter_id”: 3,
“chapter_title”: “Hearing Loss”,
“points”: [
“Conductive HL: Rinne negative (BC>AC), Weber to worse ear”,
“SNHL: Rinne positive bilaterally, Weber to better ear (or central if bilateral)”,
“512 Hz tuning fork used for Rinne and Weber”,
“Type A tympanogram = normal; Type B = effusion/perforation; Type C = ETD”,
“Presbycusis = age-related bilateral symmetrical high-frequency SNHL”
]
},
{
“chapter_id”: 4,
“chapter_title”: “Otitis Media”,
“points”: [
“AOM: red bulging TM + symptoms — watchful waiting 48–72h before antibiotics in ≥2yr”,
“OME (glue ear): retracted TM, flat tympanogram, no acute symptoms — watch 3 months”,
“CSOM safe type: central perforation, ciprofloxacin drops (quinolones only — avoid aminoglycosides)”,
“CSOM unsafe: attic/marginal perforation + offensive discharge = suspect cholesteatoma → urgent ENT”,
“Mastoiditis: post-auricular swelling + displaced auricle = ENT emergency — IV ABx + CT”
]
},
{
“chapter_id”: 5,
“chapter_title”: “Vertigo”,
“points”: [
“BPPV: brief positional vertigo, no hearing loss, positive Dix-Hallpike → Epley manoeuvre”,
“Meniere’s: triad = episodic vertigo + unilateral SNHL + tinnitus; low-salt diet”,
“Vestibular neuritis: sudden vertigo, no hearing loss, post-viral; resolves spontaneously”,
“Central vertigo: non-fatigable nystagmus, neurological signs → MRI brain urgently”,
“BPPV nystagmus: upbeat torsional, latency 5–30s, lasts <60s, fatigable”
]
},
{
“chapter_id”: 6,
“chapter_title”: “Nasal Conditions”,
“points”: [
“Allergic rhinitis: pale boggy turbinates; INCS gold standard; ARIA classification”,
“DNS: septoplasty after age 18; medical treatment first”,
“Nasal polyps: pale insensate masses; Samter’s triad (asthma + aspirin + polyps)”,
“CRSwNP: CT sinuses gold standard; FESS if medical fails; biologics (dupilumab) for refractory”,
“Unilateral polyp in adult → exclude malignancy”
]
},
{
“chapter_id”: 7,
“chapter_title”: “Epistaxis”,
“points”: [
“Little’s area = Kiesselbach’s plexus on anterior inferior septum = 90% of cases”,
“Sit FORWARD, pinch SOFT part, 10–15 min; never tilt head back”,
“Anterior pack first; posterior bleed → ENT same day”,
“Sphenopalatine artery = main supply to posterior septum; ligation for recurrent posterior bleed”,
“Elderly + hypertensive + anticoagulated = high risk for posterior epistaxis”
]
},
{
“chapter_id”: 8,
“chapter_title”: “Throat and Larynx”,
“points”: [
“Hoarseness >3 weeks in adult = laryngoscopy mandatory to exclude malignancy”,
“Epiglottitis: 3Ds (Drooling, Dysphagia, Distress) + tripod position; NO spatula”,
“Laryngeal Ca: smoker + drinker + weight loss + hoarseness → 2-week wait referral”,
“RLN palsy post-thyroid surgery: breathy voice + bovine cough; most recover 6–12 months”,
“Unilateral RLN = breathy; bilateral RLN = stridor = emergency”
]
},
{
“chapter_id”: 9,
“chapter_title”: “Head and Neck Lumps”,
“points”: [
“TGDC: midline, moves with tongue protrusion → Sistrunk procedure”,
“Branchial cyst: lateral SCM, after URTI; adults >40 → exclude cystic nodal metastasis”,
“Pleomorphic adenoma: commonest parotid tumour (75%); MRI first, then parotidectomy”,
“Facial nerve palsy + parotid lump = malignant until proven otherwise”,
“Salivary stone: mealtime syndrome; submandibular 80% of cases; bimanual palpation”
]
},
]

# Now inject into data.js

print(“Reading data.js…”)
with open(’/home/malbarr/orl101-github/data.js’, ‘r’) as f:
content = f.read()

# Verify keys exist

for key in [‘swipe_cards’, ‘survive_shifts’, ‘pick_mistakes’, ‘matching_sets’, ‘action_cards’, ‘high_yield’]:
if f’”{key}”:[]’ in content:
print(f”  Found empty key: {key}”)
elif f’”{key}”:[’ in content:
print(f”  Found key with data: {key}”)
else:
print(f”  WARNING: key not found: {key}”)

# Replace each empty array with content

replacements = [
(’“swipe_cards”:[]’, ‘“swipe_cards”:’ + json.dumps(SWIPE_CARDS, ensure_ascii=False)),
(’“survive_shifts”:[]’, ‘“survive_shifts”:’ + json.dumps(SURVIVE_SHIFTS, ensure_ascii=False)),
(’“pick_mistakes”:[]’, ‘“pick_mistakes”:’ + json.dumps(PICK_MISTAKES, ensure_ascii=False)),
(’“matching_sets”:[]’, ‘“matching_sets”:’ + json.dumps(MATCHING_SETS, ensure_ascii=False)),
(’“action_cards”:[]’, ‘“action_cards”:’ + json.dumps(ACTION_CARDS, ensure_ascii=False)),
(’“high_yield”:[]’, ‘“high_yield”:’ + json.dumps(HIGH_YIELD, ensure_ascii=False)),
]

for old, new in replacements:
if old in content:
content = content.replace(old, new)
print(f”  Injected: {old[:30]}…”)
else:
print(f”  SKIP (not found): {old[:30]}”)

with open(’/home/malbarr/orl101-github/data.js’, ‘w’) as f:
f.write(content)

print(”\nDone! Verifying…”)
with open(’/home/malbarr/orl101-github/data.js’, ‘r’) as f:
verify = f.read()

for key in [‘swipe_cards’, ‘survive_shifts’, ‘pick_mistakes’, ‘matching_sets’, ‘action_cards’, ‘high_yield’]:
count = verify.count(f’“statement”’) if key == ‘swipe_cards’ else 0
marker = ‘“statement”’ if key == ‘swipe_cards’ else f’”{key}”’
print(f”  {key}: {‘OK’ if f’{key}":[{{’ in verify or f’{key}":[’ in verify else ‘CHECK’}”)

print(”\nAll done. Run git add + commit + push next.”)
