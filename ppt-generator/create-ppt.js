const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const pptx = new pptxgen();
pptx.defineLayout({ name:"WIDE", width:13.333, height:7.5 });
pptx.layout = "WIDE";

const NAVY = "0F1B2D";
const NAVY2 = "152238";
const TEAL = "00B4D8";
const WHITE = "FFFFFF";
const GREY = "F0F2F5";
const LTGREY = "A0A8B4";
const DKGREY = "8A929E";

const imgDir = "C:\\Users\\VIVEK-D\\.gemini\\antigravity\\brain\\23e73419-b198-484a-980a-4e6a5e244f6d";
const techImg = fs.readdirSync(imgDir).find(f => f.startsWith("technician_repair"));
const platImg = fs.readdirSync(imgDir).find(f => f.startsWith("platform_mockup"));
const doorImg = fs.readdirSync(imgDir).find(f => f.startsWith("doorstep_service"));

// SLIDE 1 — CINEMATIC TITLE
let s1 = pptx.addSlide();
s1.background = { fill: NAVY };
s1.addShape(pptx.shapes.RECTANGLE, { x:0, y:0, w:"100%", h:"100%", fill:{type:"solid",color:NAVY} });
s1.addShape(pptx.shapes.LINE, { x:4.5, y:1.8, w:4.3, h:0, line:{color:TEAL, width:2} });
s1.addText("INLOCFIX", { x:0, y:2.0, w:"100%", h:1.0, align:"center", fontSize:52, fontFace:"Century Gothic", color:WHITE, bold:true, charSpacing:8 });
s1.addText("From Invisible Work to Trusted Service", { x:0, y:3.0, w:"100%", h:0.5, align:"center", fontSize:16, fontFace:"Century Gothic", color:TEAL, italic:true, charSpacing:2 });
s1.addShape(pptx.shapes.LINE, { x:4.5, y:3.7, w:4.3, h:0, line:{color:TEAL, width:2} });
const team = ["D. Vivek","V. Siddharth","K. Revanth","E. Keshav Patel","G. Vamshikrishna","K. Abhisathwik"];
team.forEach((n, i) => {
  s1.addText(n, { x:0, y:4.2 + i*0.35, w:"100%", h:0.35, align:"center", fontSize:11, fontFace:"Century Gothic", color:LTGREY, charSpacing:1 });
});

// SLIDE 2 — PAIN OF THE CUSTOMER
let s2 = pptx.addSlide();
s2.background = { fill: WHITE };
s2.addShape(pptx.shapes.RECTANGLE, { x:0, y:0, w:6.5, h:7.5, fill:{type:"solid",color:NAVY} });
if(techImg) s2.addImage({ path: path.join(imgDir, techImg), x:0.3, y:0.8, w:5.9, h:5.9, rounding:true });
s2.addShape(pptx.shapes.RECTANGLE, { x:6.5, y:0, w:6.833, h:7.5, fill:{type:"solid",color:WHITE} });
s2.addText("The Broken\nLocal Service\nExperience", { x:7.0, y:0.8, w:5.5, h:2.0, fontSize:30, fontFace:"Century Gothic", color:NAVY, bold:true, lineSpacingMultiple:1.1 });
s2.addShape(pptx.shapes.LINE, { x:7.0, y:3.0, w:2.5, h:0, line:{color:TEAL, width:3} });
const pains = [
  { icon:"●", text:"Skilled workers stay invisible in neighborhoods" },
  { icon:"●", text:"Customers trust random phone contacts blindly" },
  { icon:"●", text:"No accountability, no consistency, no safety" }
];
pains.forEach((p, i) => {
  s2.addText([
    { text: p.icon + "  ", options: { color: TEAL, fontSize: 14 } },
    { text: p.text, options: { color: NAVY2, fontSize: 13 } }
  ], { x:7.0, y:3.5 + i*0.7, w:5.5, h:0.5, fontFace:"Century Gothic" });
});

// SLIDE 3 — THE UNTAPPED GAP
let s3 = pptx.addSlide();
s3.background = { fill: GREY };
s3.addText("A Massive Yet Ignored Market", { x:0, y:0.4, w:"100%", h:0.8, align:"center", fontSize:30, fontFace:"Century Gothic", color:NAVY, bold:true });
s3.addShape(pptx.shapes.LINE, { x:5.5, y:1.3, w:2.3, h:0, line:{color:TEAL, width:3} });
// Left card
s3.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:0.8, y:2.0, w:5.5, h:4.5, fill:{type:"solid",color:WHITE}, shadow:{type:"outer",blur:10,offset:3,color:"000000",opacity:0.1}, rectRadius:0.15 });
s3.addText("Existing Urban Apps", { x:0.8, y:2.3, w:5.5, h:0.6, align:"center", fontSize:18, fontFace:"Century Gothic", color:TEAL, bold:true });
s3.addShape(pptx.shapes.LINE, { x:2.3, y:3.0, w:2.5, h:0, line:{color:GREY, width:1} });
const leftItems = ["Funded & organized platforms","Metro-city focused only","High commission structures","Tech-savvy user base"];
leftItems.forEach((t, i) => {
  s3.addText("▸  " + t, { x:1.3, y:3.3 + i*0.6, w:4.5, h:0.5, fontSize:12, fontFace:"Century Gothic", color:NAVY2 });
});
// Right card
s3.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:7.0, y:2.0, w:5.5, h:4.5, fill:{type:"solid",color:NAVY}, shadow:{type:"outer",blur:10,offset:3,color:"000000",opacity:0.15}, rectRadius:0.15 });
s3.addText("Informal Local Reality", { x:7.0, y:2.3, w:5.5, h:0.6, align:"center", fontSize:18, fontFace:"Century Gothic", color:TEAL, bold:true });
s3.addShape(pptx.shapes.LINE, { x:8.5, y:3.0, w:2.5, h:0, line:{color:"2A3A52", width:1} });
const rightItems = ["80% workers are invisible","Word-of-mouth discovery","Zero digital presence","No trust verification"];
rightItems.forEach((t, i) => {
  s3.addText("▸  " + t, { x:7.5, y:3.3 + i*0.6, w:4.5, h:0.5, fontSize:12, fontFace:"Century Gothic", color:LTGREY });
});
s3.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:3.2, y:6.7, w:7.0, h:0.55, fill:{type:"solid",color:TEAL}, rectRadius:0.1 });
s3.addText("₹30,000 Cr+ unorganized local services market waiting to be digitized", { x:3.2, y:6.7, w:7.0, h:0.55, align:"center", fontSize:11, fontFace:"Century Gothic", color:WHITE, bold:true });

// SLIDE 4 — INLOCFIX SOLUTION
let s4 = pptx.addSlide();
s4.background = { fill: WHITE };
s4.addText("Digitizing Local Trust", { x:0, y:0.3, w:"100%", h:0.8, align:"center", fontSize:30, fontFace:"Century Gothic", color:NAVY, bold:true });
s4.addShape(pptx.shapes.LINE, { x:5.2, y:1.2, w:3.0, h:0, line:{color:TEAL, width:3} });
if(platImg) s4.addImage({ path: path.join(imgDir, platImg), x:2.7, y:1.5, w:8.0, h:3.5 });
const solutions = [
  { title:"Verified Worker Profiles", desc:"Background-checked local professionals" },
  { title:"Transparent Ratings", desc:"Honest reviews from your neighbors" },
  { title:"Instant Local Discovery", desc:"Find trusted help within 2 km radius" }
];
solutions.forEach((s, i) => {
  let xPos = 0.8 + i * 4.2;
  s4.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:xPos, y:5.3, w:3.8, h:1.8, fill:{type:"solid",color:NAVY}, rectRadius:0.12 });
  s4.addText(s.title, { x:xPos, y:5.5, w:3.8, h:0.5, align:"center", fontSize:13, fontFace:"Century Gothic", color:TEAL, bold:true });
  s4.addText(s.desc, { x:xPos+0.3, y:6.1, w:3.2, h:0.6, align:"center", fontSize:10, fontFace:"Century Gothic", color:LTGREY });
});

// SLIDE 5 — PLATFORM JOURNEY
let s5 = pptx.addSlide();
s5.background = { fill: NAVY };
s5.addText("How INLOCFIX Works", { x:0, y:0.5, w:"100%", h:0.8, align:"center", fontSize:30, fontFace:"Century Gothic", color:WHITE, bold:true });
s5.addShape(pptx.shapes.LINE, { x:5.0, y:1.4, w:3.3, h:0, line:{color:TEAL, width:3} });
const steps = [
  { num:"01", title:"Search Need", desc:"Tell us what service you need" },
  { num:"02", title:"Get Verified Match", desc:"We match you with trusted locals" },
  { num:"03", title:"Complete Service", desc:"Get the job done at your doorstep" },
  { num:"04", title:"Build Trust", desc:"Rate & review to help your community" }
];
steps.forEach((st, i) => {
  let xPos = 0.7 + i * 3.2;
  s5.addShape(pptx.shapes.OVAL, { x:xPos+0.9, y:2.5, w:1.2, h:1.2, fill:{type:"solid",color:TEAL} });
  s5.addText(st.num, { x:xPos+0.9, y:2.6, w:1.2, h:1.1, align:"center", fontSize:22, fontFace:"Century Gothic", color:WHITE, bold:true });
  s5.addText(st.title, { x:xPos, y:4.0, w:3.0, h:0.5, align:"center", fontSize:15, fontFace:"Century Gothic", color:WHITE, bold:true });
  s5.addText(st.desc, { x:xPos, y:4.5, w:3.0, h:0.6, align:"center", fontSize:10, fontFace:"Century Gothic", color:LTGREY });
  if(i < 3) {
    s5.addShape(pptx.shapes.LINE, { x:xPos+2.4, y:3.1, w:1.1, h:0, line:{color:TEAL, width:1.5, dashType:"dash"} });
  }
});

// SLIDE 6 — WHO WINS
let s6 = pptx.addSlide();
s6.background = { fill: GREY };
s6.addText("A Dual-Sided Value Engine", { x:0, y:0.3, w:"100%", h:0.8, align:"center", fontSize:30, fontFace:"Century Gothic", color:NAVY, bold:true });
s6.addShape(pptx.shapes.LINE, { x:4.8, y:1.2, w:3.7, h:0, line:{color:TEAL, width:3} });
// Customers card
s6.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:0.8, y:1.8, w:5.5, h:5.0, fill:{type:"solid",color:WHITE}, shadow:{type:"outer",blur:8,offset:2,color:"000000",opacity:0.08}, rectRadius:0.15 });
s6.addText("CUSTOMERS", { x:0.8, y:2.1, w:5.5, h:0.6, align:"center", fontSize:20, fontFace:"Century Gothic", color:TEAL, bold:true, charSpacing:3 });
s6.addShape(pptx.shapes.LINE, { x:2.0, y:2.8, w:3.0, h:0, line:{color:GREY, width:1} });
const custBenefits = [
  { title:"Speed", desc:"Find help in minutes, not hours" },
  { title:"Safety", desc:"Verified & community-vetted workers" },
  { title:"Trust", desc:"Reviews from your own neighborhood" }
];
custBenefits.forEach((b, i) => {
  s6.addText(b.title, { x:1.3, y:3.1 + i*1.1, w:4.5, h:0.4, fontSize:14, fontFace:"Century Gothic", color:NAVY, bold:true });
  s6.addText(b.desc, { x:1.3, y:3.5 + i*1.1, w:4.5, h:0.4, fontSize:11, fontFace:"Century Gothic", color:DKGREY });
});
// Workers card
s6.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:7.0, y:1.8, w:5.5, h:5.0, fill:{type:"solid",color:NAVY}, shadow:{type:"outer",blur:8,offset:2,color:"000000",opacity:0.12}, rectRadius:0.15 });
s6.addText("WORKERS", { x:7.0, y:2.1, w:5.5, h:0.6, align:"center", fontSize:20, fontFace:"Century Gothic", color:TEAL, bold:true, charSpacing:3 });
s6.addShape(pptx.shapes.LINE, { x:8.2, y:2.8, w:3.0, h:0, line:{color:"2A3A52", width:1} });
const workerBenefits = [
  { title:"Visibility", desc:"Get discovered by nearby customers" },
  { title:"Income", desc:"Steady work pipeline, fair pay" },
  { title:"Credibility", desc:"Build a digital professional profile" }
];
workerBenefits.forEach((b, i) => {
  s6.addText(b.title, { x:7.5, y:3.1 + i*1.1, w:4.5, h:0.4, fontSize:14, fontFace:"Century Gothic", color:TEAL, bold:true });
  s6.addText(b.desc, { x:7.5, y:3.5 + i*1.1, w:4.5, h:0.4, fontSize:11, fontFace:"Century Gothic", color:LTGREY });
});

// SLIDE 7 — REVENUE MODEL
let s7 = pptx.addSlide();
s7.background = { fill: WHITE };
s7.addText("Scalable & Sustainable", { x:0, y:0.3, w:"100%", h:0.6, align:"center", fontSize:28, fontFace:"Century Gothic", color:NAVY, bold:true });
s7.addText("Business Model", { x:0, y:0.9, w:"100%", h:0.6, align:"center", fontSize:28, fontFace:"Century Gothic", color:TEAL, bold:true });
s7.addShape(pptx.shapes.LINE, { x:5.2, y:1.6, w:3.0, h:0, line:{color:TEAL, width:3} });
const revenue = [
  { title:"Service Commission", pct:"8-12%", desc:"Per completed booking", icon:"₹" },
  { title:"Featured Listings", pct:"₹299/mo", desc:"Premium worker visibility boost", icon:"★" },
  { title:"Partner Referrals", pct:"₹50/lead", desc:"Local hardware store partnerships", icon:"⟳" }
];
revenue.forEach((r, i) => {
  let xPos = 0.7 + i * 4.2;
  s7.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:xPos, y:2.2, w:3.9, h:4.5, fill:{type:"solid",color:NAVY}, shadow:{type:"outer",blur:10,offset:3,color:"000000",opacity:0.12}, rectRadius:0.15 });
  s7.addShape(pptx.shapes.OVAL, { x:xPos+1.3, y:2.7, w:1.3, h:1.3, fill:{type:"solid",color:TEAL} });
  s7.addText(r.icon, { x:xPos+1.3, y:2.8, w:1.3, h:1.2, align:"center", fontSize:28, fontFace:"Century Gothic", color:WHITE, bold:true });
  s7.addText(r.title, { x:xPos, y:4.3, w:3.9, h:0.5, align:"center", fontSize:15, fontFace:"Century Gothic", color:WHITE, bold:true });
  s7.addText(r.pct, { x:xPos, y:4.9, w:3.9, h:0.5, align:"center", fontSize:22, fontFace:"Century Gothic", color:TEAL, bold:true });
  s7.addText(r.desc, { x:xPos+0.4, y:5.5, w:3.1, h:0.6, align:"center", fontSize:10, fontFace:"Century Gothic", color:LTGREY });
});

// SLIDE 8 — GO TO MARKET
let s8 = pptx.addSlide();
s8.background = { fill: NAVY };
s8.addShape(pptx.shapes.RECTANGLE, { x:7.5, y:0, w:5.833, h:7.5, fill:{type:"solid",color:NAVY2} });
if(doorImg) s8.addImage({ path: path.join(imgDir, doorImg), x:7.8, y:0.5, w:5.2, h:6.5, rounding:true });
s8.addText("Hyperlocal\nGrowth\nStrategy", { x:0.8, y:0.5, w:6.0, h:2.0, fontSize:32, fontFace:"Century Gothic", color:WHITE, bold:true, lineSpacingMultiple:1.1 });
s8.addShape(pptx.shapes.LINE, { x:0.8, y:2.8, w:2.5, h:0, line:{color:TEAL, width:3} });
const gtm = [
  { num:"01", title:"Hardware Store Partnerships", desc:"On-ground worker onboarding" },
  { num:"02", title:"Social Media Campaigns", desc:"Hyperlocal area-targeted ads" },
  { num:"03", title:"Referral Network", desc:"Customer-to-customer word of mouth" },
  { num:"04", title:"Community Flyers", desc:"Offline trust-building in neighborhoods" }
];
gtm.forEach((g, i) => {
  s8.addText(g.num, { x:0.8, y:3.3 + i*1.0, w:0.7, h:0.4, fontSize:16, fontFace:"Century Gothic", color:TEAL, bold:true });
  s8.addText(g.title, { x:1.6, y:3.3 + i*1.0, w:5.0, h:0.4, fontSize:13, fontFace:"Century Gothic", color:WHITE, bold:true });
  s8.addText(g.desc, { x:1.6, y:3.7 + i*1.0, w:5.0, h:0.3, fontSize:10, fontFace:"Century Gothic", color:LTGREY });
});

// SLIDE 9 — WHY WE WILL WIN
let s9 = pptx.addSlide();
s9.background = { fill: GREY };
s9.addText("Why INLOCFIX Will Matter", { x:0, y:0.4, w:"100%", h:0.8, align:"center", fontSize:30, fontFace:"Century Gothic", color:NAVY, bold:true });
s9.addShape(pptx.shapes.LINE, { x:4.5, y:1.3, w:4.3, h:0, line:{color:TEAL, width:3} });
const pillars = [
  { title:"Built for Informal India", desc:"Designed ground-up for Tier 2/3 cities and semi-urban neighborhoods where 80% of service workers operate outside any platform.", num:"01" },
  { title:"Simple Low-Tech Onboarding", desc:"WhatsApp-based registration, missed call verification, and vernacular support — zero barriers to entry for workers.", num:"02" },
  { title:"Community-First Verification", desc:"Neighborhood vouching system where local trust replaces expensive background checks — authentic and scalable.", num:"03" }
];
pillars.forEach((p, i) => {
  let xPos = 0.6 + i * 4.2;
  s9.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:xPos, y:2.0, w:4.0, h:4.8, fill:{type:"solid",color:WHITE}, shadow:{type:"outer",blur:10,offset:3,color:"000000",opacity:0.08}, rectRadius:0.15 });
  s9.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x:xPos+1.2, y:2.4, w:1.6, h:1.2, fill:{type:"solid",color:NAVY}, rectRadius:0.1 });
  s9.addText(p.num, { x:xPos+1.2, y:2.5, w:1.6, h:1.0, align:"center", fontSize:26, fontFace:"Century Gothic", color:TEAL, bold:true });
  s9.addText(p.title, { x:xPos+0.3, y:3.9, w:3.4, h:0.7, align:"center", fontSize:15, fontFace:"Century Gothic", color:NAVY, bold:true });
  s9.addText(p.desc, { x:xPos+0.3, y:4.7, w:3.4, h:1.5, align:"center", fontSize:10, fontFace:"Century Gothic", color:DKGREY, lineSpacingMultiple:1.3 });
});

// SLIDE 10 — STRONG CLOSING
let s10 = pptx.addSlide();
s10.background = { fill: NAVY };
s10.addShape(pptx.shapes.LINE, { x:3.5, y:2.0, w:6.3, h:0, line:{color:TEAL, width:2} });
s10.addText("BUILDING INDIA'S TRUSTED\nLOCAL SERVICE NETWORK", { x:0, y:2.3, w:"100%", h:1.5, align:"center", fontSize:34, fontFace:"Century Gothic", color:WHITE, bold:true, lineSpacingMultiple:1.2, charSpacing:2 });
s10.addShape(pptx.shapes.LINE, { x:3.5, y:4.0, w:6.3, h:0, line:{color:TEAL, width:2} });
const closing = [
  "Empowering invisible workers.",
  "Creating reliable service access.",
  "Scaling trust one neighborhood at a time."
];
closing.forEach((c, i) => {
  s10.addText(c, { x:0, y:4.5 + i*0.5, w:"100%", h:0.45, align:"center", fontSize:14, fontFace:"Century Gothic", color:LTGREY, italic:true });
});
s10.addText("INLOCFIX", { x:0, y:6.2, w:"100%", h:0.6, align:"center", fontSize:18, fontFace:"Century Gothic", color:TEAL, bold:true, charSpacing:5 });

const outPath = path.join(__dirname, "INLOCFIX_Presentation.pptx");
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log("SUCCESS: Presentation saved to " + outPath);
}).catch(err => {
  console.error("Error:", err);
});
