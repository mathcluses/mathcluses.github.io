// ============================================================================
//  TABLEAU DE CONVERSION À REMPLIR (6e) : longueurs, aires, volumes, contenances
//  À charger après flash.js : <script src="../commun/conversion.js"></script>
//
//  { q: "3,25 m = … cm", r: "325", widget: CONVERSION.widget("longueur", "3,25", "m", "cm") }
//  Le tableau est vide : l'élève écrit le nombre lui-même, un chiffre par case (le chiffre des unités dans la
//  colonne de l'unité de départ), complète avec des zéros si besoin, puis valide. La virgule (jaune) est déjà
//  placée après la colonne de l'unité demandée : la réponse se lit dans le tableau.
//  Aires : 2 cases par unité ; volumes : 3 cases par unité (avec les litres sous les dm³ et les cm³).
// ============================================================================
(function(){
  var O=FLASH.outils;
  var TYPES={
    longueur:{unites:["km","hm","dam","m","dm","cm","mm"],cases:1},
    contenance:{unites:["hL","daL","L","dL","cL","mL"],cases:1},
    aire:{unites:["km²","hm²","dam²","m²","dm²","cm²","mm²"],cases:2},
    volume:{unites:["m³","dm³","cm³","mm³"],cases:3,litres:{"dm³":["hL","daL","L"],"cm³":["dL","cL","mL"]}}
  };
  // la valeur (texte « 3,25 ») exprimée dans l'unité d'arrivée, en décalant la virgule (sans erreur d'arrondi)
  function convertir(txt,decalage){
    var p=String(txt).replace(/\s/g,"").split(","),e=p[0],d=p[1]||"";
    if(decalage>=0){d=d+"0".repeat(decalage);e=e+d.slice(0,decalage);d=d.slice(decalage)}
    else{e="0".repeat(-decalage)+e;d=e.slice(e.length+decalage)+d;e=e.slice(0,e.length+decalage)}
    e=e.replace(/^0+(?=\d)/,"")||"0";d=d.replace(/0+$/,"");
    return parseFloat(e+"."+(d||"0"));
  }
  function widget(type,valeur,de,vers){
    var T=TYPES[type],U=T.unites,k=T.cases,iDe=U.indexOf(de),iVers=U.indexOf(vers);
    // unités affichées : de part et d'autre des deux unités de la question (une de plus de chaque côté)
    var i0=Math.max(0,Math.min(iDe,iVers)-1),i1=Math.min(U.length-1,Math.max(iDe,iVers)+1),montre=U.slice(i0,i1+1);
    var attendu=convertir(valeur,(iVers-iDe)*k);
    return function(zone,termine){
      zone.innerHTML="";
      var aide=document.createElement("p");aide.className="pz-aide";
      aide.innerHTML="Écris "+valeur+" "+de+" dans le tableau (un chiffre par case, le chiffre des unités dans la dernière case de la colonne "+de+"), complète par des zéros si besoin, puis lis le résultat : la virgule est placée après les "+vers+".";
      zone.appendChild(aide);
      var t=document.createElement("table");t.className="tab-conv";
      var h="<tr>"+montre.map(function(u){return '<th colspan="'+k+'">'+u+'</th>'}).join("")+"</tr>";
      if(T.litres){h+="<tr class=\"conv-litres\">"+montre.map(function(u){var l=T.litres[u];return l?l.map(function(x){return "<td>"+x+"</td>"}).join(""):'<td colspan="'+k+'"></td>'}).join("")+"</tr>"}
      h+="<tr class=\"conv-saisie\">";
      montre.forEach(function(u,iu){for(var c=0;c<k;c++){
        var fin=c===k-1,virg=fin&&u===vers,cls=(c===0?"debut ":"")+(virg?"virg":"");
        h+='<td class="'+cls+'"><input inputmode="numeric" maxlength="1" autocomplete="off" aria-label="'+u+'"></td>';
      }});
      t.innerHTML=h+"</tr>";
      var boite=document.createElement("div");boite.className="conv-boite";boite.appendChild(t);zone.appendChild(boite);
      var cases=[].slice.call(t.querySelectorAll("input"));
      cases.forEach(function(inp,i){
        inp.addEventListener("input",function(){inp.value=inp.value.replace(/\D/g,"").slice(-1);if(inp.value&&cases[i+1])cases[i+1].focus()});
        inp.addEventListener("keydown",function(e){
          if(e.key==="Backspace"&&!inp.value&&cases[i-1]){cases[i-1].focus();cases[i-1].value="";e.preventDefault()}
          else if(e.key==="ArrowLeft"&&cases[i-1]){cases[i-1].focus();e.preventDefault()}
          else if(e.key==="ArrowRight"&&cases[i+1]){cases[i+1].focus();e.preventDefault()}
          else if(e.key==="Enter"){e.preventDefault();e.stopPropagation();valider()}
        });
        inp.addEventListener("focus",function(){inp.select()});
      });
      var rang=document.createElement("div");rang.className="row pz-boutons";var bt=document.createElement("button");bt.type="button";bt.textContent="Valider";
      rang.appendChild(bt);zone.appendChild(rang);bt.addEventListener("click",function(e){e.stopPropagation();valider()});
      var fait=false;
      function lire(){
        var s="";cases.forEach(function(inp){s+=(inp.value||"_")+(inp.parentNode.classList.contains("virg")?",":"")});
        s=s.replace(/^_+/,"").replace(/_+$/,"").replace(/,$/,"");if(s[0]===",")s="0"+s;
        if(!s||s.indexOf("_")>=0)return null;
        return parseFloat(s.replace(",","."));
      }
      function valider(){
        if(fait)return;fait=true;
        var v=lire(),ok=v!==null&&Math.abs(v-attendu)<1e-9*Math.max(1,attendu);
        cases.forEach(function(x){x.disabled=true;x.classList.add(ok?"pz-bon":"pz-faux")});rang.className="hide";
        termine(ok,v===null?"(tableau incomplet)":O.nb(v)+" "+vers);
      }
    };
  }
  window.CONVERSION={widget:widget,convertir:convertir,TYPES:TYPES};
})();
