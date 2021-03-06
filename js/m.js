var NowPosition; //0=index,1=archive,2=page
var nowLoading=false,nowSending=false;

document.addEventListener('DOMContentLoaded',function(){
    horwheel(document.querySelector('.archive-container'));
    document.querySelector('.archive-container').addEventListener('scroll',(e)=>{
        //从0开始，到300px完全消失
        var au=document.querySelector('.author-info');
        au.style.opacity=1-e.target.scrollLeft/300;
        if(au.style.opacity<=0){
            au.style.pointerEvents="none";
        }else{
            au.style.pointerEvents=null;
        }
        
        if((e.target.scrollWidth - (e.target.scrollLeft+e.target.offsetWidth)) < 200){
            loadMoreArticles();
        }
    })
    document.querySelector('#archive').addEventListener('scroll',(e)=>{
        if((e.target.scrollHeight - (e.target.scrollTop+e.target.offsetHeight)) < 200){
            loadMoreArticles();
        }
    })
    window.addEventListener("popstate", function(e) { 
        back();
    }, false);
})

document.addEventListener('keyup',function(e){
    if(e.key=="Escape"){
        back();
    }
})

function Move(inEl,outEl,direction){
    MoveCheck(inEl,outEl);
    var inEl=document.querySelector(inEl);
    var outEl=document.querySelector(outEl);
    var removeList=new Array;
    inEl.classList.forEach((n)=>{if(n.indexOf("move-")!=-1){removeList.push(n);}})
    removeList.map(e=>inEl.classList.remove(e));
    removeList=[];
    outEl.classList.forEach((n)=>{if(n.indexOf("move-")!=-1){removeList.push(n);}})
    removeList.map(e=>outEl.classList.remove(e));
    removeList=[];
    inEl.classList.add('move-show');
    outEl.classList.add('move-show');
    inEl.classList.add('move-animation-' + direction + '-in');
    outEl.classList.add('move-animation-' + direction + '-out');
    setTimeout(function(outEl) {
        outEl.classList.remove('move-show');}, 800,outEl);
}

function ShowNav(){
    if(!document.querySelector('.hidden').show){
        document.querySelector('.hidden').classList.add('show');
        document.querySelector('.menu .mdi-menu').classList.add('rotate');
        document.querySelector('.hidden').show=true;
    }else{
        document.querySelector('.hidden').classList.remove('show');
        document.querySelector('.menu .mdi-menu').classList.remove('rotate');
        document.querySelector('.hidden').show=false;
    }
}

function loadMoreArticles(){
    var nextPageURL;
    if(typeof pageInfo == "undefined"){
        return false;
    }
    if(nowLoading==true){
        return false;
    }
    if(pageInfo.currentPage >= Math.ceil(pageInfo.total / pageInfo.pageSize)){
        console.log('到底了~');
        return false;
    }
    nowLoading=true;
    if(pageInfo.permaLink){
        nextPageURL=pageInfo.permaLink + (parseInt(pageInfo.currentPage) + 1) + "/";
    }else if(pageInfo.type == "index" || pageInfo.type == "index_page" ){
        nextPageURL="/page/" + (parseInt(pageInfo.currentPage) + 1) + "/";
    }
    fetch(nextPageURL + "?ajaxload",{credentials:'include'}).then(data=>data.text()).then(text=>{
        parseToDOM(text).forEach((el)=>{
            if(el.tagName=="DIV"){
                document.querySelector('.article-list').appendChild(el);
            }
        });
        pageInfo.currentPage=parseInt(pageInfo.currentPage) + 1;
        nowLoading=false;
    });
}

function parseToDOM(str){
   var div = document.createElement("div");
   if(typeof str == "string")
       div.innerHTML = str;
   return div.childNodes;
}

function showArticle(url){
    document.querySelector('.archive-container').style.overflow="hidden";
    Move('#page','#archive','down');
    document.querySelector('#back').style.transform="rotate(90deg)";
    history.pushState(null,null,url);
    if(url.substr(-1)!='/' && url.indexOf('archives')!=-1){url+="/"}
    fetch(url+"?ajaxload",{credentials:'include'}).then(data=>data.text()).then(text=>{
        parseToDOM(text).forEach((el)=>{
            if(el.tagName=="DIV"){
                if(document.querySelector('.page-wrapper')){document.querySelector('.page-wrapper').remove()};
                document.querySelector('.page-container').appendChild(el);
                var codeBlocks=document.querySelectorAll('pre code').forEach((e)=>{
                　　hljs.highlightBlock(e);
                });
                document.querySelector('#page').scrollTo({"top":0});
            }
        });
    });
}

function MoveCheck(inEl,outEl){
    if(outEl=="#index"){
        document.querySelector('#back').style.opacity=1;
    }
    if(inEl=="#page"){
        document.querySelector('#back').style.transform="rotate(90deg)";
        setTimeout(function() {document.querySelector("#page").style.overflowY="scroll"}, 800);
        document.querySelector(".drop-down").style.transform="translate(0)";
        document.querySelector(".drop-down").style.opacity="1";
    }
    if(outEl=="#page"){
        document.querySelector("#page").style.overflowY="hidden";
        document.querySelector(".drop-down").style.transform="translate(-30px)";
        document.querySelector(".drop-down").style.opacity="0";
    }
    if(inEl=="#archive"){
        setTimeout(function() {document.querySelector(".archive-container").style.overflowX="scroll";}, 800);
    }
}

function back(){
    var current=document.querySelector('.move-show').id;
    if(current=="page"){
        Move('#archive','#page','up');
        document.querySelector('#back').style.transform=null;
        history.pushState(null,null,"/");
    }else if(current=="archive"){
        Move('#index','#archive','left');
        document.querySelector('#back').style.opacity=0;
    }
    
}

window.commentMode=0; //0为邮箱Gravatar，1为使用QQ头像
window.TypechoComment={
    reply: function(el,id){
        var replyEl=document.querySelector('.reply-info');
        replyEl.classList.remove('reply-info-closed');
        replyEl.querySelector('#reply-name').innerText=document.getElementById(el).querySelector('.comment-author-name').innerText;
        document.getElementById('comment-parent').value=id;
        document.querySelector('#page').scrollTo({"behavior": "smooth", "top":replyEl.offsetTop-500});
    },

    cancelReply: function(){
        var replyEl=document.querySelector('.reply-info');
        replyEl.classList.add('reply-info-closed');
        document.getElementById('comment-parent').value="";
    }
}


function changeCommentAvatarMode(){
    if(window.commentMode==0){
        document.querySelector('#avatarMode').style.d="path('M3.18,13.54C3.76,12.16 4.57,11.14 5.17,10.92C5.16,10.12 5.31,9.62 5.56,9.22C5.56,9.19 5.5,8.86 5.72,8.45C5.87,4.85 8.21,2 12,2C15.79,2 18.13,4.85 18.28,8.45C18.5,8.86 18.44,9.19 18.44,9.22C18.69,9.62 18.84,10.12 18.83,10.92C19.43,11.14 20.24,12.16 20.82,13.55C21.57,15.31 21.69,17 21.09,17.3C20.68,17.5 20.03,17 19.42,16.12C19.18,17.1 18.58,18 17.73,18.71C18.63,19.04 19.21,19.58 19.21,20.19C19.21,21.19 17.63,22 15.69,22C13.93,22 12.5,21.34 12.21,20.5H11.79C11.5,21.34 10.07,22 8.31,22C6.37,22 4.79,21.19 4.79,20.19C4.79,19.58 5.37,19.04 6.27,18.71C5.42,18 4.82,17.1 4.58,16.12C3.97,17 3.32,17.5 2.91,17.3C2.31,17 2.43,15.31 3.18,13.54Z')";
        document.querySelector('#mail').placeholder="请输入QQ号";
        window.commentMode=1;
    }else{
        document.querySelector('#avatarMode').style.d="path('M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z')";
        document.querySelector('#mail').placeholder="←点此使用QQ头像";
        window.commentMode=0;
        
    }
}

function sendComment(){
    if(nowSending){return false;}
    nowSending=true;
    var form=document.querySelector('#comment-form');
    var data = new FormData(form);
    if(window.commentMode==1){
        data.set("mail",data.get('mail')+"@use.qq.avatar");
    }
    fetch(form.action,{credentials:'include',method: "POST",body:data}).then(function(data){return data.text()}).then(function(text){
        nowSending=false;
        if(text.indexOf('Error')!=-1){
            alert(parseToDOM(text)[7].innerText.trim());
        }else{
            document.querySelector('.respond #textarea').value="";
            var newComment=document.querySelector('#comments>li').cloneNode(1);
            if(newComment.querySelector('.comment-children')){newComment.removeChild(newComment.querySelector('.comment-children'))};
            newComment.querySelector('.comment-author-name').innerText=data.get('author');
            newComment.querySelector('.avatar').src='https://gravatar.cat.net/avatar/' + data.get('mail').MD5(32) + '?s=55&r=G&d=';
            newComment.querySelector('.comment-content').innerHTML='<p>' + data.get('text') + '</p>';
            newComment.querySelector('.comment-time').innerText=new Date().toISOString().replace('T',' ').substr(0,new Date().toISOString().replace('T',' ').lastIndexOf(':'));
            var comment_list=document.querySelector('.comment-list')
            if(!comment_list){
                comment_list=document.createElement('ol');
                comment_list.classList.add('comment-list');
                document.querySelector('#comments').appendChild(comment_list);
            }
            comment_list.appendChild(newComment);
            alert('评论成功');
        }
    });
}

function biggerFont(){
    var target=document.querySelector('.page-wrapper .content');
    target.style.fontSize= (target.style.fontSize=='') ? '15px' : target.style.fontSize;
    target.style.fontSize=(parseInt(target.style.fontSize)+1) + "px"; 
}