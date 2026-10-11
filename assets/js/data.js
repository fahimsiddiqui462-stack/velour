/* VELOUR product catalogue (static demo data) */
(function(){
  const U = "https://images.unsplash.com/";
  const P = "https://images.pexels.com/photos/";
  const us = (id, w=800) => `${U}${id}?auto=format&fit=crop&w=${w}&q=75`;
  const pe = (id, w=800) => `${P}${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

  window.VELOUR = {
    brand: "VELOUR",
    currency: "$",
    categories: [
      { key: "women",       label: "Women",       img: us("photo-1617922001439-4a2e6562f328", 900), count: 42 },
      { key: "men",         label: "Men",         img: us("photo-1618886614638-80e3c103d31a", 900), count: 31 },
      { key: "accessories", label: "Accessories", img: us("photo-1584917865442-de89df76afd3", 900), count: 18 }
    ],
    products: [
      { id:1,  name:"Cashmere Overcoat",        cat:"Outerwear",   dept:"women", price:580, tag:"",     img:us("photo-1617922001439-4a2e6562f328"),
        desc:"A softly tailored overcoat in 100% traceable cashmere, cut long and double-faced for warmth without weight.",
        colors:["#3A342B","#9C6B3F","#C8A97E"], sizes:["XS","S","M","L","XL"], material:"100% Cashmere", care:"Dry clean only" },
      { id:2,  name:"Silk Slip Dress",          cat:"Dresses",     dept:"women", price:240, tag:"new",  img:us("photo-1500917293891-ef795e70e1f6"),
        desc:"A bias-cut slip in lustrous mulberry silk, finished with adjustable straps and a fluid drape.",
        colors:["#7B2D26","#3A342B","#C8A97E"], sizes:["XS","S","M","L"], material:"100% Mulberry Silk", care:"Hand wash cold" },
      { id:3,  name:"Structured Leather Tote",  cat:"Bags",        dept:"accessories", price:390, tag:"", img:us("photo-1584917865442-de89df76afd3"),
        desc:"An architectural everyday tote in vegetable-tanned leather, with a suede-lined interior and magnetic closure.",
        colors:["#3A342B","#9C6B3F"], sizes:["One size"], material:"Italian Full-Grain Leather", care:"Wipe clean" },
      { id:4,  name:"Sculpted Sunglasses",      cat:"Eyewear",     dept:"accessories", price:165, tag:"", img:us("photo-1577803645773-f96470509666"),
        desc:"Hand-finished acetate frames with polarised lenses and a sculpted brow-line silhouette.",
        colors:["#17140F","#9C6B3F"], sizes:["One size"], material:"Italian Acetate", care:"Case supplied" },
      { id:5,  name:"Oxford Leather Loafers",   cat:"Shoes",       dept:"men", price:320, tag:"",     img:us("photo-1617689563472-c66428e83d17"),
        desc:"A classic penny loafer in polished calf leather with a Blake-stitched leather sole.",
        colors:["#3A342B","#7B2D26"], sizes:["40","41","42","43","44","45"], material:"Calf Leather", care:"Shoe trees advised" },
      { id:6,  name:"Gold Vermeil Necklace",    cat:"Jewellery",   dept:"accessories", price:145, tag:"new", img:us("photo-1599643478518-a784e5dc4c8f"),
        desc:"A fine chain in recycled gold vermeil over sterling silver, hallmarked and made to layer.",
        colors:["#C8A97E"], sizes:["One size"], material:"18k Gold Vermeil", care:"Keep dry" },
      { id:7,  name:"Signature Eau de Parfum",  cat:"Fragrance",   dept:"accessories", price:120, tag:"", img:us("photo-1541643600914-78b084683601"),
        desc:"Cedar, iris and a whisper of leather — a warm, quiet signature that settles close to the skin.",
        colors:["#C8A97E"], sizes:["50ml","100ml"], material:"Eau de Parfum", care:"Store away from light" },
      { id:8,  name:"Automatic Field Watch",    cat:"Watches",     dept:"accessories", price:450, tag:"", img:us("photo-1620625515032-6ed0c1790c75"),
        desc:"A slim automatic in brushed steel with a sapphire crystal and a hand-stitched leather strap.",
        colors:["#17140F","#3A342B"], sizes:["One size"], material:"Stainless Steel", care:"Water resistant 5ATM" },
      { id:9,  name:"Merino Knit Sweater",      cat:"Knitwear",    dept:"women", price:190, tag:"",     img:us("photo-1572853566605-af9816b0a77a"),
        desc:"A relaxed crew-neck in extra-fine merino, fully fashioned for a clean, considered line.",
        colors:["#C8A97E","#3A342B","#7B2D26"], sizes:["XS","S","M","L","XL"], material:"100% Extra-fine Merino", care:"Hand wash" },
      { id:10, name:"Tailored Linen Blazer",    cat:"Tailoring",   dept:"men", price:340, tag:"new",  img:us("photo-1488161628813-04466f872be2"),
        desc:"An unstructured blazer in European linen with a soft shoulder and half-canvas construction.",
        colors:["#C8A97E","#3A342B"], sizes:["46","48","50","52","54"], material:"100% European Linen", care:"Dry clean" },
      { id:11, name:"Minimal Leather Sneakers", cat:"Shoes",       dept:"men", price:210, tag:"",     img:pe("1027130"),
        desc:"A pared-back court sneaker in soft leather with a cup sole and recycled laces.",
        colors:["#FFFFFF","#3A342B"], sizes:["40","41","42","43","44","45"], material:"Leather / Rubber", care:"Wipe clean" },
      { id:12, name:"Wide-Leg Wool Trousers",   cat:"Trousers",    dept:"women", price:180, tag:"sale", img:us("photo-1441984904996-e0b6ba687e04"),
        desc:"High-waisted trousers in fluid wool, cut wide with a pressed centre crease.",
        colors:["#3A342B","#C8A97E"], sizes:["XS","S","M","L","XL"], material:"100% Wool", care:"Dry clean" },
      { id:13, name:"Soft Cashmere Scarf",      cat:"Accessories", dept:"accessories", price:130, tag:"", img:us("photo-1600857062241-98e5dba7f214"),
        desc:"A generous scarf in featherweight cashmere, woven in Scotland and finished by hand.",
        colors:["#9C6B3F","#3A342B","#C8A97E"], sizes:["One size"], material:"100% Cashmere", care:"Hand wash" },
      { id:14, name:"Classic Trench Coat",      cat:"Outerwear",   dept:"men", price:420, tag:"",     img:us("photo-1490114538077-0a7f8cb49891"),
        desc:"A water-resistant cotton-gabardine trench with storm flaps and a removable belt.",
        colors:["#C8A97E","#3A342B"], sizes:["46","48","50","52","54"], material:"Cotton Gabardine", care:"Dry clean" },
      { id:15, name:"Leather Card Holder",      cat:"Accessories", dept:"accessories", price:95, tag:"new", img:us("photo-1594223274512-ad4803739b7c"),
        desc:"A slim card holder in smooth calf leather with six slots and a central note pocket.",
        colors:["#3A342B","#7B2D26"], sizes:["One size"], material:"Calf Leather", care:"Wipe clean" },
      { id:16, name:"Fine Silver Hoop Earrings",cat:"Jewellery",   dept:"accessories", price:110, tag:"", img:us("photo-1535632066927-ab7c9ab60908"),
        desc:"Everyday hoops in recycled sterling silver, lightweight and endlessly wearable.",
        colors:["#C0C0C0","#C8A97E"], sizes:["One size"], material:"Recycled Sterling Silver", care:"Keep dry" },
      { id:17, name:"Ribbed Wool Beanie",       cat:"Accessories", dept:"accessories", price:75,  tag:"", img:us("photo-1517502166878-35c93a0072f0"),
        desc:"A ribbed beanie in soft lambswool, knitted in a small family mill.",
        colors:["#3A342B","#7B2D26","#C8A97E"], sizes:["One size"], material:"Lambswool", care:"Hand wash" },
      { id:18, name:"Linen Shirt Dress",        cat:"Dresses",     dept:"women", price:210, tag:"",     img:us("photo-1515886657613-9f3515b0c78f"),
        desc:"A relaxed shirt dress in washed linen with a self-tie waist and mother-of-pearl buttons.",
        colors:["#C8A97E","#FFFFFF"], sizes:["XS","S","M","L","XL"], material:"100% Washed Linen", care:"Machine wash cold" },
      { id:19, name:"Suede Chelsea Boots",      cat:"Shoes",       dept:"women", price:290, tag:"",     img:us("photo-1605733160314-4fc7dac4bb16"),
        desc:"Chelsea boots in soft suede with elasticated side panels and a stacked leather heel.",
        colors:["#9C6B3F","#3A342B"], sizes:["36","37","38","39","40","41"], material:"Suede Leather", care:"Protect with spray" },
      { id:20, name:"Tortoise Acetate Frames",  cat:"Eyewear",     dept:"accessories", price:150, tag:"sale", img:us("photo-1473496169904-658ba7c44d8a"),
        desc:"Optical-ready frames in warm tortoise acetate with a lightweight, balanced fit.",
        colors:["#9C6B3F"], sizes:["One size"], material:"Italian Acetate", care:"Case supplied" }
    ]
  };
})();
