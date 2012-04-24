;(function(){
"use strict";

define(
	function(){
		var keywordsRegEx = [
			{re:/(Dual Wield)/g,rw:""},
			{re:/(Ongoing)/g,rw:""},
			{re:/(Protector)/g,rw:""},
			{re:/(Ferocity)/g,rw:""},
			{re:/(Elusive)/g,rw:""},
			{re:/(Totem)/g,rw:""},
			{re:/(Air)/g,rw:""},
			{re:/(Earth)/g,rw:""},
			{re:/(\[Fire\])/g,rw:""},
			{re:/(Water)/g,rw:""},
			{re:/(Stealth)/g,rw:""},
			{re:/(Untargetable)/g,rw:""},
			{re:/(Thrown)/g,rw:""},
			{re:/(Shadowmeld)/g,rw:""},
			{re:/(Death Rattle)/g,rw:""},
			{re:/(Conspicuous)/g,rw:""},
			{re:/(Inspire)/g,rw:""},
			{re:/(Sabotage)/g,rw:""},
			{re:/(Diplomacy)/g,rw:""},
			{re:/(Long-Range)/g,rw:""},
			{re:/(Reward)/g,rw:""},
			{re:/(Trap)/g,rw:""},
			{re:/(Sextuple Wield)/g,rw:""},
			{re:/(Finishing Move)/g,rw:""},
			{re:/(War Stomp)/g,rw:""},
			{re:/(Berserking)/g,rw:""},
			{re:/(AWESOME)/g,rw:""},
			{re:/(Inspiring Presence)/g,rw:""},
			{re:/(Hardiness)/g,rw:""},
			{re:/(Arcane Torrent)/g,rw:""},
			{re:/(Escape Artist)/g,rw:""},
			{re:/(Find Treasure)/g,rw:""},
			{re:/(Will of the Forsaken)/g,rw:""},
			{re:/(irradiated)/g,rw:""},
			{re:/(Preparation)/g,rw:""},
			{re:/(Invincible)/g,rw:""},
			{re:/(Bear Form)/g,rw:""},
			{re:/(Cat Form)/g,rw:""}
		];
			
		var len = keywordsRegEx.length;
		var k;
		for(var i = 0; i < len; i++){
			k = keywordsRegEx[i];
			k.rw = "<span class=\"rules_keyword\">$1</span>";
		}
		
		keywordsRegEx.push(
			{re:/\n/g,rw:"<br class=\"rules_break\" />"},
			{re:/>>>/g,rw:"<img src=\"/assets/payment_result.png\" />"},
			{re:/\[Horde\]/g,rw:"<img src=\"/assets/horde_ally.png\" />"},
			{re:/\[Alliance\]/g,rw:"<img src=\"/assets/alliance_ally.png\" />"},
			{re:/\[Activate\]/g,rw:"<img src=\"/assets/activate.png\" />"},
			{re:/\(/g,rw:"<span class=\"rules_sidenote\">"},
			{re:/\)/g,rw:"</span>"},
			{re:/(Pay[s]? )([0-9]|[x])|(Pay[s]? )([0-9][0-9])/im,rw:"$1<span class=\"rules_pay\">&nbsp;<b>$2</b>&nbsp;</span>"},
			{re:/Mend ([0-9]|[0-9][0-9]|X)/m,rw:"<span class=\"rules_mends\">Mend $1</span>"},
			{re:/Assault ([0-9]|[0-9][0-9]|X)/m,rw:"<span class=\"rules_assault\">Assault $1</span>"},
			
			//matches either WORD WORD Hero Required or WORD Hero Required
			{re:/(([A-Za-z]*?|[A-Za-z]*? [A-Za-z]*?)( Hero Required))/gm,rw:"<span class=\"rules_required_hero\">$1</span>"},

			//next two matches resistance types. Can probably combine them
			{re:/(([f|F]rost|[n|N]ature|[s|S]hadow|[a|A]rcane|[f|F]ire|Physical)( [R|r]esistance))/gm,rw:"<span class=\"rules_resistance\">$1</span>"},
			{re:/((with|chosen|have) ([R|r]esistance[s]?)([,\. ]?))/gm,rw:"$2 <span class=\"rules_resistance\">$3</span>$4"},

			{re:/(([A-Za-z]*?)( Reputation))/gm,rw:"<span class=\"rules_reputation\">$1</span>"}
		);
			
		len = keywordsRegEx.length;
			
		var f = function(p){
			
			if(p === null){
				return "";
			}
			
			var out = p;

			var k;
			for(var i = 0; i < len; i++){
				k = keywordsRegEx[i];
				out = out.replace(k.re,k.rw);
			}

			return out;
		}

		return f;
	}
);

})();