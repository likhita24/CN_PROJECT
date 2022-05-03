let csrfToken = null;
let userId = null;

const Toast = Swal.mixin({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          onOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
});

function loadFiles(userid,token, only_starred,folder_id){
    csrfToken = token;
    userId = userid;
    $.ajax({
        url: "file_provider/",
        type: "post",
        data: {'user_id':userid, 'hidden':"",'folder_id':folder_id},
        headers: {'X-CSRFToken': csrfToken}, // for csrf token
        success: function(data) {
            showFiles(data,only_starred);
            loadFolders(userid,csrfToken,only_starred,true,folder_id);
        }
    });
}

function foldersload(userid,token, only_starred,folder_id){
    csrfToken = token;
    userId = userid;
    $.ajax({
        url: "folder_provider/",
        type: "post",
        data: {'user_id':userid, 'hidden':"",'folder_id':folder_id},
        headers: {'X-CSRFToken': csrfToken}, // for csrf token
        success: function(data) {
            
            loadFolders(userid,csrfToken,only_starred,true,folder_id);
        }
    });
}


function showFiles(data, only_starred, is_option=true) {
    console.log("SHOW FILE:"+is_option);
    let container = document.getElementById("files-container");
    container.innerHTML = "";
    let file_card = document.createElement("div");
    file_card.classList.add("col-md-2","m-2","text-center","p-0","rounded");
    if(only_starred){
        let JUSTAMOM = Array.from(data);
        data = Array();
        for(let i = 0; i < JUSTAMOM.length; i++){
            if(JUSTAMOM[i].file_starred){
                data.push(JUSTAMOM[i]);
            }
        }
    }

    for(let i = 0; i < data.length; i++){
        let fileExtension = data[i].file_title.substr((data[i].file_title.lastIndexOf('.') + 1)).toUpperCase();

        let TC = file_card.cloneNode(true);
        TC.classList.add("bg-light");
        let filename = document.createElement("div");
        filename.classList.add("font-weight-bold",'bg-info','text-white','p-2','notch');
        filename.innerText = data[i].file_title.length > 20? data[i].file_title.substring(0,15)+"...": data[i].file_title;

        let filedate = document.createElement("div");
        filedate.classList.add("text-muted",'p-1','d-flex','justify-content-between');
        

        TC.id = "file-card-" +i;
        let iteme = null;
        if(Array("JPEG","PNG","JPG","GIF","TIFF","BMP","APNG","SVG","WEBP").includes(fileExtension)){
            iteme = document.createElement("img");
            iteme.height = 128;
            iteme.style.objectFit = "cover";

        }
        else if(Array("MP4","OGV","WEBM","MKV").includes(fileExtension)){
            iteme = document.createElement("video");
            iteme.height = 123;
            iteme.controls = true;
        }

        if(iteme != null){
            iteme.src = data[i].file_link;
            iteme.classList.add("w-100");
            TC.appendChild(iteme);
            TC.appendChild(filename);
            TC.appendChild(filedate);
            addOptions(data[i],TC,i,is_option);
            container.appendChild(TC);
        }
        else{
            d3.xml("../static/img/file_bg.svg", "image/svg+xml", function(xml) {
                let importedNode = document.importNode(xml.documentElement, true);
                importedNode.classList.add("col");
                importedNode.getElementById("ext-text").textContent = fileExtension;
                TC.appendChild(importedNode);
                if(Array("MP3","WAV","OGG").includes(fileExtension)){
                    importedNode.style.height = "83px";
                    iteme = document.createElement("audio");
                    iteme.controls = true;
                    iteme.src = data[i].file_link;
                    iteme.classList.add("w-100");
                    iteme.style.height = "40px";
                    TC.appendChild(iteme);
                }
                TC.appendChild(filename);
                TC.appendChild(filedate);
                addOptions(data[i],TC,i,is_option);
                container.appendChild(TC);
            });
        }


    }
    //file_card.remove();
}

function addOptions(data, fileCard, i, is_option) {
    console.log("ADD OPTION:"+is_option);
    let OPC = document.createElement("div");
    OPC.id = "options-"+i;
    OPC.classList.add("w-100");
    if(is_option){
        let SBTN = document.createElement("button");
        SBTN.classList.add("btn","col-md-4","bg-light","rounded-0","m-0");
        SBTN.innerHTML = "<i class='fas fa-share-alt text-success'></i>";
        SBTN.setAttribute("data-toggle","modal");
        SBTN.setAttribute("data-target","#shareModal");
        SBTN.setAttribute("data-extra",data.id);
        SBTN.setAttribute("data-is_folder",0);

        

        let DBTN = document.createElement("button");
        DBTN.classList.add("btn","col-md-4","bg-light","rounded-0","m-0");
        DBTN.innerHTML = "<i class='fas fa-trash text-danger'></i>";
        DBTN.onclick = function(){
            then((result) => {
              if (result.value) {
                deleteFile({'user_id':data.user_id,'file_id':data.id, 'file_link':data.file_link.substring(1)}, fileCard);
              }
            });

        };
        OPC.appendChild(SBTN);
        OPC.appendChild(DBTN);

    }

    let DBTN = document.createElement("a");
    DBTN.download = true;
    DBTN.href = "http://localhost:8000/file_download?era="+data.file_link.substring(1)+"&iera="+data.user_id;
    DBTN.classList.add("btn","col-md-12","bg-dark","rounded-0","m-0");
    DBTN.innerHTML = "<i class='fas fa-download text-white'></i>";

    OPC.appendChild(DBTN);

    fileCard.appendChild(OPC);
}

function loadFolders(userid,token,only_starred,is_option=true,parent=null) {
    let SDTA = {'user_id':userid};
    if(parent != null){
        SDTA.parent_id = parent;
    }
    $.ajax({
        url: "folder_provider/",
        type: "post",
        data: SDTA,
        headers: {'X-CSRFToken': token},
        success: function(data) {
            if(only_starred){
                for(let i = 0; i < data.length; i++){
                    let JUSTAMOM = Array.from(data);
                    data = Array();
                    for(let i = 0; i < JUSTAMOM.length; i++){
                        if(JUSTAMOM[i].folder_starred){
                            data.push(JUSTAMOM[i]);
                        }
                    }
                }
            }
            showFolders(data,is_option);
        }
    });
}

function setFolderOptions(userid,container) {
$.ajax({
        url: "folder_provider/",
        type: "post",
        data: {'user_id':userid,'show_nested':true},
        headers: {'X-CSRFToken': csrfToken}, // for csrf token
        success: function(data) {
                container.innerHTML = "";
                let DOP = document.createElement("option");
                DOP.innerText = "Select Folder";
                DOP.value = "";
                container.appendChild(DOP);

                for(i = 0; i < data.length; i++){
                    let option = document.createElement("option");
                    let VNAAM = data[i].folder_link.substring(10).substring( data[i].folder_link.substring(10).indexOf("/")+1);
                    option.innerText = VNAAM;
                    option.value = data[i].id;
                    container.appendChild(option);
                }
        }
    });
}

function showFolders(data,is_option) {
    let FOCNT = document.getElementById("folder-container");
    FOCNT.innerHTML = "";
    for(i = 0; i < data.length; i++){
                let R = document.createElement("tr");
                let FID = document.createElement("input");
                FID.type = "hidden";
                FID.readOnly = true;
                FID.value = data[i].id;

                let FINDID = document.createElement("td");
                let optionCol = document.createElement("td");
                let DFDT = document.createElement("td");
                let FNAAMA = document.createElement("td");

                if(is_option){
                    
                    let SBTN = document.createElement("button");
                     let shareBtnhandler = function(row_data){
                        return function () { shareFolder(row_data.user_id,row_data.folder_link,row_data.id,R); }
                    };
                    SBTN.onclick = shareBtnhandler(data[i]);
                    SBTN.classList.add("btn","btn-success","m-2");
                    SBTN.innerHTML = "<i class='fas fa-share text-white'></i>";
                    SBTN.setAttribute("data-toggle","modal");
                    SBTN.setAttribute("data-target","#shareModal");
                    SBTN.setAttribute("data-extra",data[i].id);
                    SBTN.setAttribute("data-is_folder",1);
                    optionCol.appendChild(SBTN);

                    //---DELETE FOLDER-------------------------------------------------------------
                    let DBTN = document.createElement("button");
                    let deleteBtnhandler = function(row_data){
                        return function () { deleteFolder(row_data.user_id,row_data.folder_link,row_data.id,R); }
                    };
                    DBTN.onclick = deleteBtnhandler(data[i]);
                    DBTN.classList.add("btn","btn-danger","m-2");
                    DBTN.innerHTML = "<i class='fas fa-trash text-white'></i>";
                    optionCol.appendChild(DBTN);
                }

                //---DOWNLOAD FOLDER-----------------------------------------------------------
                let DBTN = document.createElement("a");
                DBTN.href = "http://localhost:8000/folder_download?era="+data[i].folder_link+"&iera="+data[i].user_id;

                DBTN.classList.add("btn","bg-dark","m-2");
                DBTN.innerHTML = "<i class='fas fa-download text-white'></i>";
                optionCol.appendChild(DBTN);


                FINDID.innerText = i+1;
                FNAAMA.innerText = data[i].folder_name;
                DFDT.innerText = data[i].folder_date;
                R.appendChild(FID);
                R.appendChild(FINDID);
                R.appendChild(FNAAMA);
                R.appendChild(DFDT);
                R.appendChild(optionCol);

                let clickHandler = function(row_data){
                    return function () {
                        if(is_option)
                            window.location.href = ("http://localhost:8000/dashboard?folder_id="+row_data.id);
                        else
                            window.location.href = ("http://localhost:8000/shared?folder_id="+row_data.id);
                    }
                };
                FNAAMA.style.cursor = "pointer";
                FNAAMA.onclick = clickHandler(data[i]);
                FOCNT.appendChild(R);
    }
}


function deleteFile(SDTA,iteme) {
    $.ajax({
        url: "delete",
        type: "post",
        data: SDTA,
        headers: {'X-CSRFToken': csrfToken}, // for csrf token
        success: function(data) {
             if(data.Status){
                iteme.remove();
            }
            else{
                alert("CANNOT DELETE. PLEASE TRY AGAIN!");
            }
        }
    });
}

function saveFolder(userid) {
    $.ajax({
        url:"save_folder",
        type:"post",
        data:{'user_id':userid, 'folder_name':document.getElementById("foldernamebox").value, 'parent_id':document.getElementById("folderOptions2").value},
        headers: {'X-CSRFToken': csrfToken}, // for csrf token
        success:function (data) {
            if(data.status){
                loadFolders(userid,csrfToken);
            }
            else{
                Toast.fire({
                      title: 'Error occurred!'
                });
            }
        }

    })
}

function deleteFolder(userId,folder_link,FID,iteme) {
    SDTA = {'user_id':userId, 'folder_link':folder_link, 'folder_id':FID};
    then((result) => {
          if (result.value) {
            
             $.ajax({
                url: "delete_folder",
                type: "post",
                data: SDTA,
                headers: {'X-CSRFToken': csrfToken}, // for csrf token
                success: function(data) {
                     if(data.Status){
                        iteme.remove();
                    }
                    else{
                        alert("CANNOT DELETE! PLEASE TRY AGAIN.");
                    }
                }
            });
          }
        });
}

// Helper functions ========================================================================================================
function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes === 0) return '0 Byte';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}
