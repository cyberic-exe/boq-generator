/* global bootstrap, showNotification, addCategory, addItemToCategory, calculateTotals */

// ---------------------------------------------------------------------------
// Utility guard — use escapeHtml from core.js if available, otherwise define
// ---------------------------------------------------------------------------

if (typeof window.escapeHtml !== 'function') {
    window.escapeHtml = function (text) {
        if (text == null) return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(String(text)));
        return div.innerHTML;
    };
}

// ---------------------------------------------------------------------------
// Construction pricelist dataset
// ---------------------------------------------------------------------------

const CONSTRUCTION_PRICELIST = {
    "Concrete Works": [
        { id: "CW1", description: "Concrete Mix (3000 psi)", unit: "cu.m", rate: 3500, type: "Material", category: "Concrete Works" },
        { id: "CW2", description: "Concrete Mix (4000 psi)", unit: "cu.m", rate: 4000, type: "Material", category: "Concrete Works" },
        { id: "CW3", description: "Concrete Mix (5000 psi)", unit: "cu.m", rate: 4500, type: "Material", category: "Concrete Works" },
        { id: "CW4", description: "Ready Mix Concrete Delivery", unit: "trip", rate: 5000, type: "Material", category: "Concrete Works" },
        { id: "CW5", description: "Concrete Pumping Service", unit: "hr", rate: 2500, type: "Service", category: "Concrete Works" },
        { id: "CW6", description: "Concrete Vibrator Rental", unit: "day", rate: 800, type: "Equipment", category: "Concrete Works" },
        { id: "CW7", description: "Concrete Finishing Labor", unit: "sq.m", rate: 250, type: "Labor", category: "Concrete Works" },
        { id: "CW8", description: "Concrete Curing Labor", unit: "sq.m", rate: 150, type: "Labor", category: "Concrete Works" }
    ],
    "Reinforcement Works": [
        { id: "RW1", description: "Rebar 10mm (ø10mm)", unit: "pc", rate: 180, type: "Material", category: "Reinforcement Works" },
        { id: "RW2", description: "Rebar 12mm (ø12mm)", unit: "pc", rate: 250, type: "Material", category: "Reinforcement Works" },
        { id: "RW3", description: "Rebar 16mm (ø16mm)", unit: "pc", rate: 450, type: "Material", category: "Reinforcement Works" },
        { id: "RW4", description: "Rebar 20mm (ø20mm)", unit: "pc", rate: 700, type: "Material", category: "Reinforcement Works" },
        { id: "RW5", description: "Rebar Tie Wire (16kg)", unit: "roll", rate: 350, type: "Material", category: "Reinforcement Works" },
        { id: "RW6", description: "Rebar Cutting & Bending", unit: "kg", rate: 12, type: "Labor", category: "Reinforcement Works" },
        { id: "RW7", description: "Rebar Installation Labor", unit: "kg", rate: 15, type: "Labor", category: "Reinforcement Works" },
        { id: "RW8", description: "Rebar Support Chairs", unit: "pc", rate: 25, type: "Material", category: "Reinforcement Works" }
    ],
    "Formworks": [
        { id: "FW1", description: "Plywood Form 4' x 8' x 12mm", unit: "sheet", rate: 850, type: "Material", category: "Formworks" },
        { id: "FW2", description: "Plywood Form 4' x 8' x 18mm", unit: "sheet", rate: 1200, type: "Material", category: "Formworks" },
        { id: "FW3", description: "2\" x 3\" Lumber for Forms", unit: "ln.m", rate: 85, type: "Material", category: "Formworks" },
        { id: "FW4", description: "2\" x 4\" Lumber for Forms", unit: "ln.m", rate: 110, type: "Material", category: "Formworks" },
        { id: "FW5", description: "Form Nails 3\"", unit: "kg", rate: 65, type: "Material", category: "Formworks" },
        { id: "FW6", description: "Form Oil", unit: "gal", rate: 280, type: "Material", category: "Formworks" },
        { id: "FW7", description: "Formwork Installation Labor", unit: "sq.m", rate: 350, type: "Labor", category: "Formworks" },
        { id: "FW8", description: "Formwork Removal Labor", unit: "sq.m", rate: 150, type: "Labor", category: "Formworks" },
        { id: "FW9", description: "Shoring Rental", unit: "set/day", rate: 500, type: "Equipment", category: "Formworks" }
    ],
    "Masonry Works": [
        { id: "MW1", description: "CHB 4\" (10x20x40cm)", unit: "pc", rate: 18, type: "Material", category: "Masonry Works" },
        { id: "MW2", description: "CHB 6\" (15x20x40cm)", unit: "pc", rate: 28, type: "Material", category: "Masonry Works" },
        { id: "MW3", description: "CHB 8\" (20x20x40cm)", unit: "pc", rate: 38, type: "Material", category: "Masonry Works" },
        { id: "MW4", description: "Cement", unit: "bag", rate: 280, type: "Material", category: "Masonry Works" },
        { id: "MW5", description: "Sand", unit: "cu.m", rate: 1200, type: "Material", category: "Masonry Works" },
        { id: "MW6", description: "Gravel", unit: "cu.m", rate: 1800, type: "Material", category: "Masonry Works" },
        { id: "MW7", description: "Mason Labor (CHB Laying)", unit: "sq.m", rate: 300, type: "Labor", category: "Masonry Works" },
        { id: "MW8", description: "Mason Helper Labor", unit: "sq.m", rate: 200, type: "Labor", category: "Masonry Works" },
        { id: "MW9", description: "Plastering Labor (Wall Finish)", unit: "sq.m", rate: 180, type: "Labor", category: "Masonry Works" }
    ],
    "Carpentry Works": [
        { id: "CP1", description: "2\" x 2\" Lumber (Mahogany)", unit: "ln.m", rate: 95, type: "Material", category: "Carpentry Works" },
        { id: "CP2", description: "2\" x 3\" Lumber (Mahogany)", unit: "ln.m", rate: 120, type: "Material", category: "Carpentry Works" },
        { id: "CP3", description: "2\" x 4\" Lumber (Mahogany)", unit: "ln.m", rate: 150, type: "Material", category: "Carpentry Works" },
        { id: "CP4", description: "1\" x 6\" Lumber (Plywood)", unit: "ln.m", rate: 110, type: "Material", category: "Carpentry Works" },
        { id: "CP5", description: "Plywood 4' x 8' x 1/2\"", unit: "sheet", rate: 650, type: "Material", category: "Carpentry Works" },
        { id: "CP6", description: "Plywood 4' x 8' x 3/4\"", unit: "sheet", rate: 950, type: "Material", category: "Carpentry Works" },
        { id: "CP7", description: "Carpenter Labor", unit: "day", rate: 800, type: "Labor", category: "Carpentry Works" },
        { id: "CP8", description: "Carpenter Helper Labor", unit: "day", rate: 550, type: "Labor", category: "Carpentry Works" },
        { id: "CP9", description: "Wood Nails (assorted)", unit: "kg", rate: 75, type: "Material", category: "Carpentry Works" },
        { id: "CP10", description: "Wood Screws (assorted)", unit: "box", rate: 150, type: "Material", category: "Carpentry Works" },
        { id: "CP11", description: "Wood Glue", unit: "gal", rate: 350, type: "Material", category: "Carpentry Works" }
    ],
    "Steel Works": [
        { id: "SW1", description: "Angle Bar 1\" x 1\" x 1/4\"", unit: "ln.m", rate: 220, type: "Material", category: "Steel Works" },
        { id: "SW2", description: "Angle Bar 1-1/2\" x 1-1/2\" x 1/4\"", unit: "ln.m", rate: 280, type: "Material", category: "Steel Works" },
        { id: "SW3", description: "Angle Bar 2\" x 2\" x 1/4\"", unit: "ln.m", rate: 350, type: "Material", category: "Steel Works" },
        { id: "SW4", description: "C-Purlin 4\" x 2\"", unit: "ln.m", rate: 320, type: "Material", category: "Steel Works" },
        { id: "SW5", description: "C-Purlin 6\" x 2\"", unit: "ln.m", rate: 380, type: "Material", category: "Steel Works" },
        { id: "SW6", description: "Steel Plate 1/4\" thick", unit: "sq.m", rate: 850, type: "Material", category: "Steel Works" },
        { id: "SW7", description: "Steel Plate 1/2\" thick", unit: "sq.m", rate: 1600, type: "Material", category: "Steel Works" },
        { id: "SW8", description: "Steel Fabrication Labor", unit: "kg", rate: 25, type: "Labor", category: "Steel Works" },
        { id: "SW9", description: "Steel Installation Labor", unit: "kg", rate: 20, type: "Labor", category: "Steel Works" },
        { id: "SW10", description: "Welding Electrodes", unit: "kg", rate: 120, type: "Material", category: "Steel Works" },
        { id: "SW11", description: "Welding Gas", unit: "cylinder", rate: 1500, type: "Material", category: "Steel Works" }
    ],
    "Roofing Works": [
        { id: "RW01", description: "G.I. Sheet 0.40mm (26ga)", unit: "sheet", rate: 450, type: "Material", category: "Roofing Works" },
        { id: "RW02", description: "G.I. Sheet 0.50mm (24ga)", unit: "sheet", rate: 650, type: "Material", category: "Roofing Works" },
        { id: "RW03", description: "Long Span Roof 0.40mm", unit: "sheet", rate: 750, type: "Material", category: "Roofing Works" },
        { id: "RW04", description: "Long Span Roof 0.50mm", unit: "sheet", rate: 950, type: "Material", category: "Roofing Works" },
        { id: "RW05", description: "Roof Insulation (1/2\")", unit: "sq.m", rate: 150, type: "Material", category: "Roofing Works" },
        { id: "RW06", description: "Roof Screws with Seal", unit: "pc", rate: 8, type: "Material", category: "Roofing Works" },
        { id: "RW07", description: "Roof Ridge Roll", unit: "pc", rate: 350, type: "Material", category: "Roofing Works" },
        { id: "RW08", description: "Roof Gutter", unit: "ln.m", rate: 180, type: "Material", category: "Roofing Works" },
        { id: "RW09", description: "Downspout", unit: "ln.m", rate: 120, type: "Material", category: "Roofing Works" },
        { id: "RW10", description: "Roofing Installation Labor", unit: "sq.m", rate: 250, type: "Labor", category: "Roofing Works" }
    ],
    "Ceiling Works": [
        { id: "CL1", description: "Gypsum Board 4' x 8' x 1/2\"", unit: "sheet", rate: 350, type: "Material", category: "Ceiling Works" },
        { id: "CL2", description: "Gypsum Board 4' x 8' x 5/8\"", unit: "sheet", rate: 420, type: "Material", category: "Ceiling Works" },
        { id: "CL3", description: "PVC Ceiling Board", unit: "ln.m", rate: 85, type: "Material", category: "Ceiling Works" },
        { id: "CL4", description: "Acoustic Ceiling Tile 2' x 2'", unit: "pc", rate: 120, type: "Material", category: "Ceiling Works" },
        { id: "CL5", description: "Ceiling Frame (Metal Furring)", unit: "ln.m", rate: 45, type: "Material", category: "Ceiling Works" },
        { id: "CL6", description: "Ceiling Hanger Wire", unit: "kg", rate: 65, type: "Material", category: "Ceiling Works" },
        { id: "CL7", description: "Ceiling Screws", unit: "box", rate: 180, type: "Material", category: "Ceiling Works" },
        { id: "CL8", description: "Ceiling Installation Labor", unit: "sq.m", rate: 200, type: "Labor", category: "Ceiling Works" },
        { id: "CL9", description: "Ceiling Painting Labor", unit: "sq.m", rate: 150, type: "Labor", category: "Ceiling Works" }
    ],
    "Tile Works": [
        { id: "TW1", description: "Ceramic Tile 30x30cm", unit: "sq.m", rate: 350, type: "Material", category: "Tile Works" },
        { id: "TW2", description: "Ceramic Tile 40x40cm", unit: "sq.m", rate: 450, type: "Material", category: "Tile Works" },
        { id: "TW3", description: "Porcelain Tile 60x60cm", unit: "sq.m", rate: 850, type: "Material", category: "Tile Works" },
        { id: "TW4", description: "Granite Tile 60x60cm", unit: "sq.m", rate: 2500, type: "Material", category: "Tile Works" },
        { id: "TW5", description: "Marble Tile 60x60cm", unit: "sq.m", rate: 3000, type: "Material", category: "Tile Works" },
        { id: "TW6", description: "Tile Adhesive (20kg)", unit: "bag", rate: 280, type: "Material", category: "Tile Works" },
        { id: "TW7", description: "Tile Grout (5kg)", unit: "bag", rate: 180, type: "Material", category: "Tile Works" },
        { id: "TW8", description: "Tile Spacers", unit: "pack", rate: 25, type: "Material", category: "Tile Works" },
        { id: "TW9", description: "Tile Cutter Rental", unit: "day", rate: 400, type: "Equipment", category: "Tile Works" },
        { id: "TW10", description: "Tile Installation Labor", unit: "sq.m", rate: 400, type: "Labor", category: "Tile Works" }
    ],
    "Painting Works": [
        { id: "PT1", description: "Primer (Gallon)", unit: "gal", rate: 450, type: "Material", category: "Painting Works" },
        { id: "PT2", description: "Latex Paint (Gallon)", unit: "gal", rate: 650, type: "Material", category: "Painting Works" },
        { id: "PT3", description: "Enamel Paint (Gallon)", unit: "gal", rate: 850, type: "Material", category: "Painting Works" },
        { id: "PT4", description: "Epoxy Paint (Gallon)", unit: "gal", rate: 1200, type: "Material", category: "Painting Works" },
        { id: "PT5", description: "Waterproofing Paint (Gallon)", unit: "gal", rate: 1500, type: "Material", category: "Painting Works" },
        { id: "PT6", description: "Paint Thinner (Gallon)", unit: "gal", rate: 350, type: "Material", category: "Painting Works" },
        { id: "PT7", description: "Paint Brush Set", unit: "set", rate: 150, type: "Material", category: "Painting Works" },
        { id: "PT8", description: "Paint Roller Set", unit: "set", rate: 120, type: "Material", category: "Painting Works" },
        { id: "PT9", description: "Paint Sprayer Rental", unit: "day", rate: 600, type: "Equipment", category: "Painting Works" },
        { id: "PT10", description: "Painter Labor", unit: "sq.m", rate: 100, type: "Labor", category: "Painting Works" },
        { id: "PT11", description: "Surface Preparation Labor", unit: "sq.m", rate: 80, type: "Labor", category: "Painting Works" }
    ],
    "Plumbing Works": [
        { id: "PL1", description: "PVC Pipe 1/2\" (20mm)", unit: "ln.m", rate: 45, type: "Material", category: "Plumbing Works" },
        { id: "PL2", description: "PVC Pipe 3/4\" (25mm)", unit: "ln.m", rate: 65, type: "Material", category: "Plumbing Works" },
        { id: "PL3", description: "PVC Pipe 1\" (32mm)", unit: "ln.m", rate: 85, type: "Material", category: "Plumbing Works" },
        { id: "PL4", description: "PVC Pipe 1-1/2\" (40mm)", unit: "ln.m", rate: 120, type: "Material", category: "Plumbing Works" },
        { id: "PL5", description: "PVC Pipe 2\" (50mm)", unit: "ln.m", rate: 150, type: "Material", category: "Plumbing Works" },
        { id: "PL6", description: "PVC Pipe 3\" (80mm)", unit: "ln.m", rate: 220, type: "Material", category: "Plumbing Works" },
        { id: "PL7", description: "PVC Pipe 4\" (100mm)", unit: "ln.m", rate: 280, type: "Material", category: "Plumbing Works" },
        { id: "PL8", description: "PVC Fittings (assorted)", unit: "pc", rate: 35, type: "Material", category: "Plumbing Works" },
        { id: "PL9", description: "PVC Cement (Gallon)", unit: "gal", rate: 250, type: "Material", category: "Plumbing Works" },
        { id: "PL10", description: "Plumber Labor", unit: "day", rate: 850, type: "Labor", category: "Plumbing Works" },
        { id: "PL11", description: "Plumber Helper Labor", unit: "day", rate: 550, type: "Labor", category: "Plumbing Works" }
    ],
    "Electrical Works": [
        { id: "EW1", description: "Electrical Wire THHN 2.0mm²", unit: "roll", rate: 650, type: "Material", category: "Electrical Works" },
        { id: "EW2", description: "Electrical Wire THHN 3.5mm²", unit: "roll", rate: 950, type: "Material", category: "Electrical Works" },
        { id: "EW3", description: "Electrical Wire THHN 5.5mm²", unit: "roll", rate: 1500, type: "Material", category: "Electrical Works" },
        { id: "EW4", description: "PVC Conduit Pipe 1/2\"", unit: "ln.m", rate: 35, type: "Material", category: "Electrical Works" },
        { id: "EW5", description: "PVC Conduit Pipe 3/4\"", unit: "ln.m", rate: 50, type: "Material", category: "Electrical Works" },
        { id: "EW6", description: "PVC Conduit Pipe 1\"", unit: "ln.m", rate: 65, type: "Material", category: "Electrical Works" },
        { id: "EW7", description: "Utility Box 4\"x4\"", unit: "pc", rate: 45, type: "Material", category: "Electrical Works" },
        { id: "EW8", description: "Switch & Outlet (single)", unit: "pc", rate: 85, type: "Material", category: "Electrical Works" },
        { id: "EW9", description: "Circuit Breaker 20A", unit: "pc", rate: 350, type: "Material", category: "Electrical Works" },
        { id: "EW10", description: "Circuit Breaker 30A", unit: "pc", rate: 450, type: "Material", category: "Electrical Works" },
        { id: "EW11", description: "Circuit Breaker 40A", unit: "pc", rate: 550, type: "Material", category: "Electrical Works" },
        { id: "EW12", description: "Electrician Labor", unit: "day", rate: 900, type: "Labor", category: "Electrical Works" },
        { id: "EW13", description: "Electrician Helper Labor", unit: "day", rate: 600, type: "Labor", category: "Electrical Works" }
    ],
    "Doors & Windows": [
        { id: "DW1", description: "Main Door (Solid Wood)", unit: "set", rate: 8500, type: "Material", category: "Doors & Windows" },
        { id: "DW2", description: "Bedroom Door (Hollow Core)", unit: "set", rate: 3500, type: "Material", category: "Doors & Windows" },
        { id: "DW3", description: "Bathroom Door (PVC)", unit: "set", rate: 2800, type: "Material", category: "Doors & Windows" },
        { id: "DW4", description: "Sliding Aluminum Door", unit: "set", rate: 6500, type: "Material", category: "Doors & Windows" },
        { id: "DW5", description: "Sliding Glass Door", unit: "set", rate: 8500, type: "Material", category: "Doors & Windows" },
        { id: "DW6", description: "Casement Window (Aluminum)", unit: "set", rate: 3500, type: "Material", category: "Doors & Windows" },
        { id: "DW7", description: "Sliding Window (Aluminum)", unit: "set", rate: 3200, type: "Material", category: "Doors & Windows" },
        { id: "DW8", description: "Awning Window", unit: "set", rate: 3800, type: "Material", category: "Doors & Windows" },
        { id: "DW9", description: "Window Screen", unit: "sq.m", rate: 350, type: "Material", category: "Doors & Windows" },
        { id: "DW10", description: "Door Lock Set", unit: "set", rate: 450, type: "Material", category: "Doors & Windows" },
        { id: "DW11", description: "Door Hinges (pair)", unit: "pair", rate: 85, type: "Material", category: "Doors & Windows" },
        { id: "DW12", description: "Door Installation Labor", unit: "set", rate: 500, type: "Labor", category: "Doors & Windows" },
        { id: "DW13", description: "Window Installation Labor", unit: "set", rate: 400, type: "Labor", category: "Doors & Windows" }
    ],
    "Flooring Works": [
        { id: "FL1", description: "Vinyl Flooring (2mm)", unit: "sq.m", rate: 450, type: "Material", category: "Flooring Works" },
        { id: "FL2", description: "Vinyl Flooring (3mm)", unit: "sq.m", rate: 650, type: "Material", category: "Flooring Works" },
        { id: "FL3", description: "Laminate Flooring", unit: "sq.m", rate: 850, type: "Material", category: "Flooring Works" },
        { id: "FL4", description: "Engineered Wood Flooring", unit: "sq.m", rate: 1200, type: "Material", category: "Flooring Works" },
        { id: "FL5", description: "Solid Hardwood Flooring", unit: "sq.m", rate: 2500, type: "Material", category: "Flooring Works" },
        { id: "FL6", description: "Epoxy Floor Coating", unit: "sq.m", rate: 850, type: "Material", category: "Flooring Works" },
        { id: "FL7", description: "Polished Concrete", unit: "sq.m", rate: 650, type: "Material", category: "Flooring Works" },
        { id: "FL8", description: "Floor Leveling Compound", unit: "bag", rate: 350, type: "Material", category: "Flooring Works" },
        { id: "FL9", description: "Flooring Underlayment", unit: "sq.m", rate: 85, type: "Material", category: "Flooring Works" },
        { id: "FL10", description: "Flooring Installation Labor", unit: "sq.m", rate: 300, type: "Labor", category: "Flooring Works" }
    ],
    "Glass & Aluminum Works": [
        { id: "GA1", description: "Clear Glass 6mm", unit: "sq.m", rate: 850, type: "Material", category: "Glass & Aluminum Works" },
        { id: "GA2", description: "Clear Glass 10mm", unit: "sq.m", rate: 1200, type: "Material", category: "Glass & Aluminum Works" },
        { id: "GA3", description: "Tempered Glass 8mm", unit: "sq.m", rate: 1800, type: "Material", category: "Glass & Aluminum Works" },
        { id: "GA4", description: "Tempered Glass 10mm", unit: "sq.m", rate: 2200, type: "Material", category: "Glass & Aluminum Works" },
        { id: "GA5", description: "Aluminum Profile 2\"x2\"", unit: "ln.m", rate: 150, type: "Material", category: "Glass & Aluminum Works" },
        { id: "GA6", description: "Aluminum Profile 2\"x3\"", unit: "ln.m", rate: 180, type: "Material", category: "Glass & Aluminum Works" },
        { id: "GA7", description: "Aluminum Profile 3\"x3\"", unit: "ln.m", rate: 220, type: "Material", category: "Glass & Aluminum Works" },
        { id: "GA8", description: "Aluminum Sliding Track", unit: "ln.m", rate: 120, type: "Material", category: "Glass & Aluminum Works" },
        { id: "GA9", description: "Glass Aluminum Sealant", unit: "tube", rate: 85, type: "Material", category: "Glass & Aluminum Works" },
        { id: "GA10", description: "Glass Installation Labor", unit: "sq.m", rate: 450, type: "Labor", category: "Glass & Aluminum Works" },
        { id: "GA11", description: "Aluminum Installation Labor", unit: "ln.m", rate: 180, type: "Labor", category: "Glass & Aluminum Works" }
    ],
    "Earthworks": [
        { id: "EW01", description: "Backhoe Rental (8hrs)", unit: "day", rate: 6500, type: "Equipment", category: "Earthworks" },
        { id: "EW02", description: "Payloader Rental (8hrs)", unit: "day", rate: 5500, type: "Equipment", category: "Earthworks" },
        { id: "EW03", description: "Dump Truck Rental (8hrs)", unit: "day", rate: 4500, type: "Equipment", category: "Earthworks" },
        { id: "EW04", description: "Compactor Rental", unit: "day", rate: 2500, type: "Equipment", category: "Earthworks" },
        { id: "EW05", description: "Excavation Labor", unit: "cu.m", rate: 350, type: "Labor", category: "Earthworks" },
        { id: "EW06", description: "Backfilling Labor", unit: "cu.m", rate: 250, type: "Labor", category: "Earthworks" },
        { id: "EW07", description: "Compaction Labor", unit: "sq.m", rate: 120, type: "Labor", category: "Earthworks" },
        { id: "EW08", description: "Hauling Labor", unit: "cu.m", rate: 200, type: "Labor", category: "Earthworks" },
        { id: "EW09", description: "Site Clearing Labor", unit: "sq.m", rate: 85, type: "Labor", category: "Earthworks" }
    ],
    "Labor Rates": [
        { id: "L1", description: "Foreman", unit: "day", rate: 1200, type: "Labor", category: "Labor Rates" },
        { id: "L2", description: "Carpenter", unit: "day", rate: 800, type: "Labor", category: "Labor Rates" },
        { id: "L3", description: "Mason", unit: "day", rate: 850, type: "Labor", category: "Labor Rates" },
        { id: "L4", description: "Electrician", unit: "day", rate: 900, type: "Labor", category: "Labor Rates" },
        { id: "L5", description: "Plumber", unit: "day", rate: 850, type: "Labor", category: "Labor Rates" },
        { id: "L6", description: "Welder", unit: "day", rate: 950, type: "Labor", category: "Labor Rates" },
        { id: "L7", description: "Painter", unit: "day", rate: 750, type: "Labor", category: "Labor Rates" },
        { id: "L8", description: "Tile Setter", unit: "day", rate: 850, type: "Labor", category: "Labor Rates" },
        { id: "L9", description: "Steelman", unit: "day", rate: 800, type: "Labor", category: "Labor Rates" },
        { id: "L10", description: "Laborer/Helper", unit: "day", rate: 550, type: "Labor", category: "Labor Rates" }
    ],
    "Equipment Rental": [
        { id: "E1", description: "Generator Set 5KVA", unit: "day", rate: 1500, type: "Equipment", category: "Equipment Rental" },
        { id: "E2", description: "Generator Set 10KVA", unit: "day", rate: 2500, type: "Equipment", category: "Equipment Rental" },
        { id: "E3", description: "Air Compressor", unit: "day", rate: 800, type: "Equipment", category: "Equipment Rental" },
        { id: "E4", description: "Concrete Mixer 1 bagger", unit: "day", rate: 650, type: "Equipment", category: "Equipment Rental" },
        { id: "E5", description: "Concrete Mixer 2 bagger", unit: "day", rate: 850, type: "Equipment", category: "Equipment Rental" },
        { id: "E6", description: "Concrete Vibrator", unit: "day", rate: 400, type: "Equipment", category: "Equipment Rental" },
        { id: "E7", description: "Welding Machine", unit: "day", rate: 600, type: "Equipment", category: "Equipment Rental" },
        { id: "E8", description: "Power Tools Set", unit: "set/day", rate: 500, type: "Equipment", category: "Equipment Rental" },
        { id: "E9", description: "Scaffolding Set", unit: "set/day", rate: 350, type: "Equipment", category: "Equipment Rental" },
        { id: "E10", description: "Ladder (Extension)", unit: "day", rate: 150, type: "Equipment", category: "Equipment Rental" }
    ],
    "Safety & Accessories": [
        { id: "SA1", description: "Hard Hat", unit: "pc", rate: 120, type: "Material", category: "Safety & Accessories" },
        { id: "SA2", description: "Safety Shoes", unit: "pair", rate: 850, type: "Material", category: "Safety & Accessories" },
        { id: "SA3", description: "Safety Vest", unit: "pc", rate: 150, type: "Material", category: "Safety & Accessories" },
        { id: "SA4", description: "Safety Glasses", unit: "pc", rate: 85, type: "Material", category: "Safety & Accessories" },
        { id: "SA5", description: "Gloves (pair)", unit: "pair", rate: 45, type: "Material", category: "Safety & Accessories" },
        { id: "SA6", description: "Dust Mask (box)", unit: "box", rate: 120, type: "Material", category: "Safety & Accessories" },
        { id: "SA7", description: "Ear Protection", unit: "pc", rate: 180, type: "Material", category: "Safety & Accessories" },
        { id: "SA8", description: "First Aid Kit", unit: "kit", rate: 650, type: "Material", category: "Safety & Accessories" },
        { id: "SA9", description: "Fire Extinguisher", unit: "pc", rate: 850, type: "Material", category: "Safety & Accessories" },
        { id: "SA10", description: "Safety Signages", unit: "set", rate: 350, type: "Material", category: "Safety & Accessories" }
    ]
};

// ---------------------------------------------------------------------------
// Flat pricelist (built immediately so all functions can reference it)
// ---------------------------------------------------------------------------

const FLAT_CONSTRUCTION_PRICELIST = {
    labor: [],
    materials: []
};

Object.entries(CONSTRUCTION_PRICELIST).forEach(([category, items]) => {
    items.forEach(item => {
        const itemWithCategory = {
            ...item,
            category: item.category || category
        };
        if (item.type === "Labor") {
            FLAT_CONSTRUCTION_PRICELIST.labor.push(itemWithCategory);
        } else {
            FLAT_CONSTRUCTION_PRICELIST.materials.push(itemWithCategory);
        }
    });
});

// ---------------------------------------------------------------------------
// Pricelist modal
// ---------------------------------------------------------------------------

function openPricelistModal() {
    let existingModal = document.getElementById('pricelistModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'pricelistModal';
    modal.setAttribute('data-bs-backdrop', 'static');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="modal-dialog modal-fullscreen-md-down modal-xl modal-dialog-scrollable">
            <div class="modal-content vh-100">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        <i class="bi bi-tools me-2"></i>Construction Pricelist
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-0 d-flex flex-column">
                    <div class="sticky-top bg-white p-3 border-bottom">
                        <div class="input-group">
                            <span class="input-group-text bg-light border-end-0">
                                <i class="bi bi-search"></i>
                            </span>
                            <input type="text"
                                   id="pricelistSearch"
                                   class="form-control border-start-0"
                                   placeholder="Search items..."
                                   style="font-size: 16px; min-height: 44px;">
                        </div>
                    </div>
                    <div class="border-bottom">
                        <ul class="nav nav-tabs nav-fill flex-nowrap" id="pricelistTabs" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active px-3 py-2"
                                        id="allItemsTabBtn"
                                        data-bs-toggle="tab"
                                        data-bs-target="#allItemsTabPane"
                                        type="button"
                                        role="tab"
                                        style="font-size: 14px; white-space: nowrap;">
                                    <i class="bi bi-grid me-1"></i>All Items
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link px-3 py-2"
                                        id="laborTabBtn"
                                        data-bs-toggle="tab"
                                        data-bs-target="#laborTabPane"
                                        type="button"
                                        role="tab"
                                        style="font-size: 14px; white-space: nowrap;">
                                    <i class="bi bi-person-badge me-1"></i>Labor
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link px-3 py-2"
                                        id="materialsTabBtn"
                                        data-bs-toggle="tab"
                                        data-bs-target="#materialsTabPane"
                                        type="button"
                                        role="tab"
                                        style="font-size: 14px; white-space: nowrap;">
                                    <i class="bi bi-box-seam me-1"></i>Materials
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div class="tab-content flex-grow-1 overflow-hidden" id="pricelistTabContent">
                        <div class="tab-pane fade show active h-100" id="allItemsTabPane" role="tabpanel">
                            <div id="allItemsContent" class="h-100 overflow-auto p-3"></div>
                        </div>
                        <div class="tab-pane fade h-100" id="laborTabPane" role="tabpanel">
                            <div id="laborContent" class="h-100 overflow-auto p-3"></div>
                        </div>
                        <div class="tab-pane fade h-100" id="materialsTabPane" role="tabpanel">
                            <div id="materialsContent" class="h-100 overflow-auto p-3"></div>
                        </div>
                    </div>
                    <div class="border-top bg-light p-3">
                        <small class="text-muted d-block">
                            <i class="bi bi-info-circle me-1"></i>
                            Click <span class="badge bg-success">Add to BOQ</span> to insert item
                        </small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary w-100 py-2" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle me-1"></i>Close
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const modalInstance = new bootstrap.Modal(modal, {
        backdrop: true,
        keyboard: true
    });
    modalInstance.show();

    setTimeout(() => {
        document.getElementById('allItemsContent').innerHTML =
            renderPricelistTableMobile([...FLAT_CONSTRUCTION_PRICELIST.labor, ...FLAT_CONSTRUCTION_PRICELIST.materials]);
        document.getElementById('laborContent').innerHTML =
            renderPricelistTableMobile(FLAT_CONSTRUCTION_PRICELIST.labor);
        document.getElementById('materialsContent').innerHTML =
            renderPricelistTableMobile(FLAT_CONSTRUCTION_PRICELIST.materials);

        const searchInput = document.getElementById('pricelistSearch');
        if (searchInput) {
            searchInput.addEventListener('input', filterPricelistMobile);
        }
    }, 100);

    modal.addEventListener('hidden.bs.modal', function () {
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
    });
}

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

function renderPricelistTableMobile(items) {
    if (!items || items.length === 0) {
        return `
            <div class="text-center py-5 text-muted">
                <i class="bi bi-search display-6 d-block mb-3"></i>
                <p>No items found. Try a different search.</p>
            </div>
        `;
    }

    const groupedByCategory = {};
    items.forEach(item => {
        if (!groupedByCategory[item.category]) {
            groupedByCategory[item.category] = [];
        }
        groupedByCategory[item.category].push(item);
    });

    let html = '';
    Object.entries(groupedByCategory).forEach(([category, categoryItems]) => {
        html += `
            <div class="card mb-3 border shadow-sm">
                <div class="card-header bg-light py-2">
                    <h6 class="mb-0 fw-bold" style="font-size: 15px;">${escapeHtml(category)}</h6>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-sm table-hover mb-0" style="font-size: 14px;">
                            <thead class="table-light">
                                <tr>
                                    <th style="min-width: 60px; font-size: 13px;">ID</th>
                                    <th style="min-width: 200px; font-size: 13px;">Description</th>
                                    <th style="min-width: 70px; font-size: 13px;">Unit</th>
                                    <th style="min-width: 100px; font-size: 13px;">Rate</th>
                                    <th style="min-width: 100px; font-size: 13px;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${categoryItems.map(item => `
                                    <tr>
                                        <td class="fw-bold" style="font-size: 12px;">${escapeHtml(item.id)}</td>
                                        <td style="font-size: 14px;">${escapeHtml(item.description)}</td>
                                        <td style="font-size: 14px;">${escapeHtml(item.unit)}</td>
                                        <td class="fw-bold text-success" style="font-size: 14px;">₱${item.rate.toLocaleString()}</td>
                                        <td>
                                            <button class="btn btn-success btn-sm py-1 px-2"
                                                    onclick="addToBOQFromPricelist('${escapeHtml(item.id)}')"
                                                    style="font-size: 12px; white-space: nowrap;">
                                                <i class="bi bi-plus-lg me-1"></i>Add
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    });

    return html;
}

function renderPricelistTable(items) {
    if (!items || items.length === 0) {
        return '<p class="text-muted text-center py-4">No items found. Please adjust your search.</p>';
    }

    const groupedByCategory = {};
    items.forEach(item => {
        if (!groupedByCategory[item.category]) {
            groupedByCategory[item.category] = [];
        }
        groupedByCategory[item.category].push(item);
    });

    let html = '';
    Object.entries(groupedByCategory).forEach(([category, categoryItems]) => {
        html += `
            <div class="card mb-3">
                <div class="card-header py-2 bg-light">
                    <h6 class="mb-0">${escapeHtml(category)}</h6>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th width="5%">ID</th>
                                    <th width="45%">Description</th>
                                    <th width="15%">Unit</th>
                                    <th width="20%">Rate (₱)</th>
                                    <th width="15%">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${categoryItems.map(item => `
                                    <tr>
                                        <td>${escapeHtml(item.id)}</td>
                                        <td>${escapeHtml(item.description)}</td>
                                        <td>${escapeHtml(item.unit)}</td>
                                        <td class="fw-bold">₱${item.rate.toLocaleString()}</td>
                                        <td>
                                            <button class="btn btn-success btn-sm" onclick="addToBOQFromPricelist('${escapeHtml(item.id)}')">
                                                <i class="bi bi-plus-lg"></i> Add to BOQ
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    });

    return html;
}

// ---------------------------------------------------------------------------
// Search / filter
// ---------------------------------------------------------------------------

function filterPricelistMobile() {
    const searchTerm = document.getElementById('pricelistSearch').value.toLowerCase().trim();

    let activeContentId = '';
    if (document.querySelector('#allItemsTabPane.active')) activeContentId = 'allItemsContent';
    if (document.querySelector('#laborTabPane.active')) activeContentId = 'laborContent';
    if (document.querySelector('#materialsTabPane.active')) activeContentId = 'materialsContent';
    if (!activeContentId) return;

    let items = [];
    const activeTabBtn = document.querySelector('#pricelistTabs .nav-link.active');
    if (activeTabBtn && activeTabBtn.id === 'allItemsTabBtn') {
        items = [...FLAT_CONSTRUCTION_PRICELIST.labor, ...FLAT_CONSTRUCTION_PRICELIST.materials];
    } else if (activeTabBtn && activeTabBtn.id === 'laborTabBtn') {
        items = FLAT_CONSTRUCTION_PRICELIST.labor;
    } else if (activeTabBtn && activeTabBtn.id === 'materialsTabBtn') {
        items = FLAT_CONSTRUCTION_PRICELIST.materials;
    }

    if (searchTerm) {
        items = items.filter(item =>
            item.description.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm) ||
            item.unit.toLowerCase().includes(searchTerm) ||
            item.id.toLowerCase().includes(searchTerm) ||
            item.type.toLowerCase().includes(searchTerm)
        );
    }

    document.getElementById(activeContentId).innerHTML = renderPricelistTableMobile(items);
}

function filterPricelist() {
    const searchTerm = document.getElementById('pricelistSearch').value.toLowerCase().trim();
    const activePane = document.querySelector('.tab-pane.active');
    if (!activePane) return;

    let items = [];
    if (activePane.id === 'allItemsTabPane') {
        items = [];
        Object.values(CONSTRUCTION_PRICELIST).forEach(categoryItems => {
            items = items.concat(categoryItems);
        });
    } else if (activePane.id === 'laborTabPane') {
        items = FLAT_CONSTRUCTION_PRICELIST.labor;
    } else if (activePane.id === 'materialsTabPane') {
        items = FLAT_CONSTRUCTION_PRICELIST.materials;
    }

    if (searchTerm) {
        items = items.filter(item =>
            item.description.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm) ||
            item.unit.toLowerCase().includes(searchTerm) ||
            item.id.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().split(' ').some(word =>
                word.includes(searchTerm)
            )
        );
    }

    activePane.innerHTML = renderPricelistTable(items);
}

// ---------------------------------------------------------------------------
// Add items to BOQ
// ---------------------------------------------------------------------------

function addToBOQFromPricelist(itemId) {
    console.log("Trying to add item ID:", itemId);

    let item = null;
    item = FLAT_CONSTRUCTION_PRICELIST.labor.find(i => i.id === itemId);
    if (!item) {
        item = FLAT_CONSTRUCTION_PRICELIST.materials.find(i => i.id === itemId);
    }
    console.log("Found item:", item);

    if (!item) {
        showNotification('Item not found! Item ID: ' + escapeHtml(itemId), 'error');
        return;
    }

    let nameInput = document.getElementById('newCategoryName');
    if (!nameInput) {
        nameInput = document.getElementById('newCategory');
    }
    if (!nameInput) {
        showNotification('Category input not found!', 'error');
        return;
    }

    const originalValue = nameInput.value;
    nameInput.value = item.category;

    let categoryDiv = Array.from(document.querySelectorAll('.category-block'))
        .find(div => {
            const titleElement = div.querySelector('.category-block__title') || div.querySelector('h6');
            return titleElement && titleElement.textContent === item.category;
        });

    if (!categoryDiv) {
        console.log("Creating new category:", item.category);
        addCategory();
        categoryDiv = document.querySelector('.category-block:last-child');
    }

    nameInput.value = originalValue;
    const categoryId = parseInt(categoryDiv.dataset.categoryId);
    console.log("Adding to category ID:", categoryId);

    addItemToCategory(categoryId);

    const tbody = categoryDiv.querySelector('tbody');
    const newRow = tbody.lastElementChild;
    const inputs = newRow.querySelectorAll('input');
    inputs[0].value = item.description;
    inputs[1].value = item.unit;
    inputs[2].value = 1;
    inputs[3].value = item.rate;

    const quantityInput = inputs[2];
    if (quantityInput) {
        quantityInput.dispatchEvent(new Event('input'));
    }

    if (window.calculateTotals) {
        window.calculateTotals();
    }

    showNotification(`"${escapeHtml(item.description)}" added to ${escapeHtml(item.category)}`, 'success');

    setTimeout(() => {
        if (categoryDiv) {
            categoryDiv.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, 300);
}

function addSampleBOQFromPricelist() {
    const sampleItems = [
        { ...FLAT_CONSTRUCTION_PRICELIST.labor[0], qty: 5 },
        { ...FLAT_CONSTRUCTION_PRICELIST.labor[1], qty: 3 },
        { ...FLAT_CONSTRUCTION_PRICELIST.materials[0], qty: 50 },
        { ...FLAT_CONSTRUCTION_PRICELIST.materials[3], qty: 500 },
        { ...FLAT_CONSTRUCTION_PRICELIST.materials[5], qty: 100 }
    ];

    const nameInput = document.getElementById('newCategoryName');
    const originalValue = nameInput.value;
    nameInput.value = 'Sample Construction';
    addCategory();

    const categoryDiv = document.querySelector('.category-block:last-child');
    nameInput.value = originalValue;
    const categoryId = parseInt(categoryDiv.dataset.categoryId);

    sampleItems.forEach(item => {
        addItemToCategory(categoryId);
        const tbody = categoryDiv.querySelector('tbody');
        const newRow = tbody.lastElementChild;
        const inputs = newRow.querySelectorAll('input');
        inputs[0].value = item.description;
        inputs[1].value = item.unit;
        inputs[2].value = 1;
        inputs[3].value = item.rate;

        const quantityInput = inputs[2];
        if (quantityInput) {
            quantityInput.dispatchEvent(new Event('input'));
        }
    });

    calculateTotals();

    const modalEl = document.getElementById('pricelistModal');
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }

    showNotification('Sample construction items added to BOQ', 'success');
}

// ---------------------------------------------------------------------------
// Global exposure
// ---------------------------------------------------------------------------

window.openPricelistModal = openPricelistModal;
window.filterPricelist = filterPricelistMobile;
window.addToBOQFromPricelist = addToBOQFromPricelist;
window.addSampleBOQFromPricelist = addSampleBOQFromPricelist;
window.renderPricelistTableMobile = renderPricelistTableMobile;
window.filterPricelistMobile = filterPricelistMobile;