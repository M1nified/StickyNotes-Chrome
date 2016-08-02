function isNotesContentSame(note1,note2){
	//skips id, date, window settings, sorted menu items
	var arethesame = true;
	var differences = {};
	if(note1.textarea !== note2.textarea){
		differences.textarea = true;
	}
	if(note1.color !== note2.color){
		differences.color = true;
	}
	if(note1.fontfamily !== note2.fontfamily){
		differences.fontfamily = true;
	}
	if(note1.fontsize !== note2.fontsize){
		differences.fontsize = true;
	}
	if(Object.keys(differences).length==0){
		return true;
	}else{
		return differences;
	}
}

DropMenu = function(){
	var menu=this;
	menu.elements=[];
	menu.boss=[];
	menu.hidetimeout=null;
	menu.addBoss=function(targets){
		if(typeof(targets)=='array' || typeof(targets)=='object'){
			$.each(targets,function(i,target){
				console.log(target)
				$(target).on('mousedown contextmenu',function(event){
					//if(event.which==2 || event.key==2){
						menu.show(event);
					//}
				})
			})
			return true;
		}
		return false;
	}
	menu.addElement = function(elems){
		if(typeof(elems)=='array' || typeof(elems)=='object'){
			$.each(elems,function(i,elem){
				menu.elements.push(elem);
			})
			return true;
		}
		return false;	
	}
	menu.show = function(event){
		if(event){
			console.log(event);
			var id=Math.random().toString().slice(2);
			var x = event.clientX;
			var y = event.clientY;
			var menubox='<div class="drop_menu" id="'+id+'" style="position:fixed;">';
			for(i in menu.elements){
				menubox+=menu.elements[i];
			}
			menubox+="</div>";
			console.log(menubox)
			$('body').append(menubox);
			menubox = $("#"+id);
			if(menubox.height()+y+15>$(window).height()){
				y=$(window).height()-menubox.height()-15;
			}
			if(menubox.width()+x+25>$(window).width()){
				x=$(window).width()-menubox.width()-25;
			}
			menubox.css('top',y);
			menubox.css('left',x);
			menu.hidetimeout=setTimeout(function(){
				//menubox.remove();
			},2000)
			menubox.on('mouseover',function(){
				clearTimeout(menu.hidetimeout);
				menu.hidetimeout=setTimeout(function(){
					//menubox.remove();
				},2000)
			})
		}
	}
	menu.hide = function(){

	}
	return this;
};
x=0;