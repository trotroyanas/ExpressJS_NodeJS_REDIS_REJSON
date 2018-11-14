//redis
var redis = require('redis');
var rejson = require('redis-rejson');

//MsSql
var sql = require("msnodesqlv8");


//Init Redis
rejson(redis);
var client = redis.createClient(6379, '192.168.56.101');

//Bdd 
const conn = "server=SQL03-REC;Database=PJMS_TRT_SMS;;Uid=usms;Pwd=4hMYM1KACHTG;Trusted_Connection=NO;Driver={SQL Server Native Client 11.0}";
const query = "exec tst_Ins_Srt @IDRouter = '#idRouter#', @typ = '#Typ#', @Event = '#Event#'";




function onError(err) {
    console.log(err);
}


function ReturnLst(nb) {
    return new Promise(function (resolve, reject) {
        client.scan(0, 'MATCH', '*', 'COUNT', nb, function (err, value) {
            if (err) {
                onError(err);
                reject(err);
            }
            var tab = value[1];
            if (tab.length !== 0) {
                resolve(tab);
            } else {
                reject("Pas de retour...")
            }

        })
    })
}


function ReturnDetails(idr) {
    return new Promise(function (resolve, reject) {

        client.json_get(idr, ".details", function (err, value) {
            if (err) {
                onError(err);
                reject(err);
            }

            //return json
            resolve(JSON.parse(value))
        })
    })
}

function AddBdd(dets, idr) {
    return new Promise(function (resolve, reject) {

        for (var z = 0; z < dets.length; z++) {
            var zer = dets[z];

            let req = query.replace(/#idRouter#/, idr).replace(/#Event#/, zer.event).replace(/#Typ#/, zer.type);
            //console.log(req)
            sql.query(conn, req, (err, rows) => {
                if (err !== null) {
                    onError(err);
                    reject(err);
                } else {
                    //console.log("Insert : " + idr + " -> ok");
                    resolve(idr);
                }
            });
        }
    })
}


function CleanRedis(idr) {
    return new Promise(function (resolve, reject) {
        client.json_del(idr, ".", function (err, result) {
            if (err !== null) {
                onError(err);
                reject(err);
            } else {
                //console.log(result);
                resolve(idr);
            }
        })
    })
}


var Glob = function (nb) {
    return new Promise(function (resolve, reject) {
        ReturnLst(nb).then(function (response) {
                //Boucle sur la liste retournée
                response.forEach(el => {
                    console.log(el);
                    ReturnDetails(el).then(function (resp) {
                        console.log("détail(s) retrouvé(s) pour la clé => " + el)
                        AddBdd(resp, el).then(function (ret) {
                            console.log("Add Bdd ok pour detail(s) de la clé => " + ret)
                            CleanRedis(ret).then(function (Clean) {
                                console.log("Clean Redis Ok pour la clé =>" + Clean);
                                resolve("Finish....")
                            })
                        });
                    });
                });
            })
            .catch(function (err) {
                console.log(err);
                client.quit();
            })

    })
}



Glob(5).then(function (ret) {
    console.log(ret);
    client.quit();
})