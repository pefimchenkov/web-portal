const db = require('../db')

const User = []

User.getBonusSale = (result) => {
	db.query(
		`SELECT Rlz.bill_1c, Rlz.project_1c, Rlz.doc_num, Rlz.doc_date, Rlz.client_1c, Rlz.client_name, Rlz.doc_sum,
			cuh.email_address HeadManager, cum.email_address Manager, cul.email_address LocalManager,
			Rlz.Key, Rlz.Status, Rlz.Client, IFNULL(Rlz.Client,CONCAT(Rlz.client_name,' *')) ClientFin,
			ROUND(Rlz.2p*
			CASE
			WHEN project_1c IN ('Продажи') THEN IFNULL(cpm.AIDC_SALE,cpg.AIDC_SALE)
			WHEN project_1c IN ('Продажи (Склад)', 'Продажи (ЗИП)') THEN IFNULL(cpm.AIDC_SALE_ZIP,cpg.AIDC_SALE_ZIP)
			WHEN project_1c IN ('Ремонт', 'Сервисный контракт', 'Сервисный контракт (ФИКС)', 'Ремонт (ФИКС)', 'Аренда Оборудования', 'СКС') THEN IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV)
			WHEN project_1c IN ('IT') THEN IFNULL(cpm.IT,cpg.IT)
			ELSE 0
			END,2) hmp,
			ROUND(Rlz.5p*
			CASE
			WHEN project_1c IN ('Продажи') THEN IFNULL(cpm.AIDC_SALE,cpg.AIDC_SALE)
			WHEN project_1c IN ('Продажи (Склад)', 'Продажи (ЗИП)') THEN IFNULL(cpm.AIDC_SALE_ZIP,cpg.AIDC_SALE_ZIP)
			WHEN project_1c IN ('Ремонт', 'Сервисный контракт', 'Сервисный контракт (ФИКС)', 'Ремонт (ФИКС)', 'Аренда Оборудования', 'СКС') THEN IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV)
			WHEN project_1c IN ('IT') THEN IFNULL(cpm.IT,cpg.IT)
			ELSE 0
			END,2) mp,
			ROUND(Rlz.3p*
			CASE
			WHEN project_1c IN ('Продажи') THEN IFNULL(cpm.AIDC_SALE,cpg.AIDC_SALE)
			WHEN project_1c IN ('Продажи (Склад)', 'Продажи (ЗИП)') THEN IFNULL(cpm.AIDC_SALE_ZIP,cpg.AIDC_SALE_ZIP)
			WHEN project_1c IN ('Ремонт', 'Сервисный контракт', 'Сервисный контракт (ФИКС)', 'Ремонт (ФИКС)', 'Аренда Оборудования', 'СКС') THEN IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV)
			WHEN project_1c IN ('IT') THEN IFNULL(cpm.IT,cpg.IT)
			ELSE 0
			END,2) lmp,
			ROUND(Rlz.3p*
			IF(Rlz.Key IS NULL,0, 
			CASE
			WHEN project_1c IN ('Продажи') THEN IFNULL(cpm.AIDC_SALE,cpg.AIDC_SALE)
			WHEN project_1c IN ('Продажи (Склад)', 'Продажи (ЗИП)') THEN IFNULL(cpm.AIDC_SALE_ZIP,cpg.AIDC_SALE_ZIP)
			WHEN project_1c IN ('Ремонт', 'Сервисный контракт', 'Сервисный контракт (ФИКС)', 'Ремонт (ФИКС)', 'Аренда Оборудования', 'СКС') THEN IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV)
			WHEN project_1c IN ('IT') THEN IFNULL(cpm.IT,cpg.IT)
			ELSE 0
			END),2) lmpX,
			CASE
			WHEN project_1c IN ('Продажи') THEN CONCAT('SALE',IF(cpm.AIDC_SALE IS NULL,'',' *'))
			WHEN project_1c IN ('Продажи (Склад)', 'Продажи (ЗИП)') THEN CONCAT('SALE_ZIP',IF(cpm.AIDC_SALE_ZIP IS NULL,'',' *'))
			WHEN project_1c IN ('Ремонт', 'Сервисный контракт', 'Сервисный контракт (ФИКС)', 'Ремонт (ФИКС)', 'Аренда Оборудования', 'СКС') THEN CONCAT('SERV',IF(cpm.AIDC_SERV IS NULL,'',' *'))
			WHEN project_1c IN ('IT') THEN CONCAT('IT',IF(cpm.IT IS NULL,'',' *'))
			ELSE 0
			END Type
		FROM (
			SELECT b.bill_1c, b.project_1c, j.doc_num, j.doc_date, b.client_1c, lp.client_name, j.doc_sum,
			cb.HEAD_MANAGER, cb.MANAGER,
			CASE
				WHEN project_1c IN ('Продажи') THEN IFNULL(cb.OM_SALE,cb.MANAGER)
				WHEN project_1c IN ('Продажи (Склад)', 'Продажи (ЗИП)') THEN IFNULL(cb.OM_SALE_ZIP,cb.MANAGER)
				WHEN project_1c IN ('Ремонт', 'Сервисный контракт', 'Сервисный контракт (ФИКС)', 'Ремонт (ФИКС)', 'Аренда Оборудования', 'СКС') THEN IFNULL(cb.OM_SERV,cb.MANAGER)
				WHEN project_1c IN ('IT') THEN IFNULL(cb.OM_IT,cb.MANAGER)
			END LOC_MAN, 
			Jira.Key, Jira.Status, ci.NAME Client, j.doc_sum*0.02 2p, j.doc_sum*0.05 5p, j.doc_sum*0.03 3p, IFNULL(ci.ID,cb.ID) FinID
			FROM 1C_Journal_1 j
			LEFT JOIN 1C_Bills_1 b ON b.bill_1c=j.doc_base_num
			LEFT JOIN LegPers lp ON lp.1c_id=b.client_1c
			LEFT JOIN CLIENTS cb ON cb.ID=lp.client_id
			LEFT JOIN (
			SELECT
			ji.ID, CONCAT(p.pkey,'-',issuenum) 'Key', ji.SUMMARY, ist.pname 'Status',
			ExtractValue(cfo.TEXTVALUE,'/content/value') 'Client', cf1c.STRINGVALUE
			FROM jiradb.jiraissue ji
			LEFT JOIN jiradb.issuestatus ist ON ist.ID=ji.issuestatus
			LEFT JOIN jiradb.project p ON p.ID=ji.PROJECT
			LEFT JOIN jiradb.customfieldvalue cfo ON cfo.ISSUE=ji.ID AND cfo.CUSTOMFIELD=11901
			LEFT JOIN jiradb.customfieldvalue cf1c ON cf1c.ISSUE=ji.ID AND cf1c.CUSTOMFIELD=10900
			WHERE ji.issuetype IN (10,12400,14200) AND CREATED >= '2019-08-01') Jira ON Jira.STRINGVALUE LIKE CONCAT('%',bill_1c,'%')
			LEFT JOIN CLIENTS ci ON ci.ID=Jira.Client
			WHERE j.doc_date >= '2020-01-01' AND j.doc_type = 'Реализация') Rlz
		LEFT JOIN jiradb.cwd_user cuh ON cuh.user_name=HEAD_MANAGER
		LEFT JOIN jiradb.cwd_user cum ON cum.user_name=MANAGER
		LEFT JOIN jiradb.cwd_user cul ON cul.user_name=LOC_MAN
		LEFT JOIN tsddb.CLIENTS cf ON cf.ID=FinID
		LEFT JOIN tsddb.crm_percents cpg ON cpg.crm_id = cf.TYPE_TABLE AND cpg.type='global'
		LEFT JOIN tsddb.crm_percents cpm ON cpm.crm_id = cf.ID`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			result(null, res)
		})
}
User.getBonusSaleSum = (email, result) => {
	db.query(
		`SELECT
			SUM(
			IF(cuh.email_address=${email},
			ROUND(Rlz.2p*
			CASE
			WHEN project_1c IN ('Продажи') THEN IFNULL(cpm.AIDC_SALE,cpg.AIDC_SALE)
			WHEN project_1c IN ('Продажи (Склад)', 'Продажи (ЗИП)') THEN IFNULL(cpm.AIDC_SALE_ZIP,cpg.AIDC_SALE_ZIP)
			WHEN project_1c IN ('Ремонт', 'Сервисный контракт', 'Сервисный контракт (ФИКС)', 'Ремонт (ФИКС)', 'Аренда Оборудования', 'СКС') THEN IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV)
			WHEN project_1c IN ('IT') THEN IFNULL(cpm.IT,cpg.IT)
			ELSE 0
			END,2),0)+
			IF(cum.email_address=${email},
			ROUND(Rlz.5p*
			CASE
			WHEN project_1c IN ('Продажи') THEN IFNULL(cpm.AIDC_SALE,cpg.AIDC_SALE)
			WHEN project_1c IN ('Продажи (Склад)', 'Продажи (ЗИП)') THEN IFNULL(cpm.AIDC_SALE_ZIP,cpg.AIDC_SALE_ZIP)
			WHEN project_1c IN ('Ремонт', 'Сервисный контракт', 'Сервисный контракт (ФИКС)', 'Ремонт (ФИКС)', 'Аренда Оборудования', 'СКС') THEN IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV)
			WHEN project_1c IN ('IT') THEN IFNULL(cpm.IT,cpg.IT)
			ELSE 0
			END,2),0)+
			IF(cul.email_address=${email},
			ROUND(Rlz.3p*
			IF(Rlz.Key IS NULL,0, 
			CASE
			WHEN project_1c IN ('Продажи') THEN IFNULL(cpm.AIDC_SALE,cpg.AIDC_SALE)
			WHEN project_1c IN ('Продажи (Склад)', 'Продажи (ЗИП)') THEN IFNULL(cpm.AIDC_SALE_ZIP,cpg.AIDC_SALE_ZIP)
			WHEN project_1c IN ('Ремонт', 'Сервисный контракт', 'Сервисный контракт (ФИКС)', 'Ремонт (ФИКС)', 'Аренда Оборудования', 'СКС') THEN IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV)
			WHEN project_1c IN ('IT') THEN IFNULL(cpm.IT,cpg.IT)
			ELSE 0
			END),2),0)) pointsX,
		
			SUM(
			IF(cuh.email_address=${email},
			ROUND(Rlz.2p*
			CASE
			WHEN project_1c IN ('Продажи') THEN IFNULL(cpm.AIDC_SALE,cpg.AIDC_SALE)
			WHEN project_1c IN ('Продажи (Склад)', 'Продажи (ЗИП)') THEN IFNULL(cpm.AIDC_SALE_ZIP,cpg.AIDC_SALE_ZIP)
			WHEN project_1c IN ('Ремонт', 'Сервисный контракт', 'Сервисный контракт (ФИКС)', 'Ремонт (ФИКС)', 'Аренда Оборудования', 'СКС') THEN IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV)
			WHEN project_1c IN ('IT') THEN IFNULL(cpm.IT,cpg.IT)
			ELSE 0
			END,2),0)+
			IF(cum.email_address=${email},
			ROUND(Rlz.5p*
			CASE
			WHEN project_1c IN ('Продажи') THEN IFNULL(cpm.AIDC_SALE,cpg.AIDC_SALE)
			WHEN project_1c IN ('Продажи (Склад)', 'Продажи (ЗИП)') THEN IFNULL(cpm.AIDC_SALE_ZIP,cpg.AIDC_SALE_ZIP)
			WHEN project_1c IN ('Ремонт', 'Сервисный контракт', 'Сервисный контракт (ФИКС)', 'Ремонт (ФИКС)', 'Аренда Оборудования', 'СКС') THEN IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV)
			WHEN project_1c IN ('IT') THEN IFNULL(cpm.IT,cpg.IT)
			ELSE 0
			END,2),0)+
			IF(cul.email_address=${email},
			ROUND(Rlz.3p*
			CASE
			WHEN project_1c IN ('Продажи') THEN IFNULL(cpm.AIDC_SALE,cpg.AIDC_SALE)
			WHEN project_1c IN ('Продажи (Склад)', 'Продажи (ЗИП)') THEN IFNULL(cpm.AIDC_SALE_ZIP,cpg.AIDC_SALE_ZIP)
			WHEN project_1c IN ('Ремонт', 'Сервисный контракт', 'Сервисный контракт (ФИКС)', 'Ремонт (ФИКС)', 'Аренда Оборудования', 'СКС') THEN IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV)
			WHEN project_1c IN ('IT') THEN IFNULL(cpm.IT,cpg.IT)
			ELSE 0
			END,2),0)) points
		FROM (
			SELECT b.bill_1c, b.project_1c, j.doc_num, j.doc_date, b.client_1c, lp.client_name, j.doc_sum,
			cb.HEAD_MANAGER, cb.MANAGER,
			CASE
				WHEN project_1c IN ('Продажи') THEN IFNULL(cb.OM_SALE,cb.MANAGER)
				WHEN project_1c IN ('Продажи (Склад)', 'Продажи (ЗИП)') THEN IFNULL(cb.OM_SALE_ZIP,cb.MANAGER)
				WHEN project_1c IN ('Ремонт', 'Сервисный контракт', 'Сервисный контракт (ФИКС)', 'Ремонт (ФИКС)', 'Аренда Оборудования', 'СКС') THEN IFNULL(cb.OM_SERV,cb.MANAGER)
				WHEN project_1c IN ('IT') THEN IFNULL(cb.OM_IT,cb.MANAGER)
			END LOC_MAN, 
			Jira.Key, Jira.Status, ci.NAME Client, j.doc_sum*0.02 2p, j.doc_sum*0.05 5p, j.doc_sum*0.03 3p, IFNULL(ci.ID,cb.ID) FinID
			FROM 1C_Journal_1 j
			LEFT JOIN 1C_Bills_1 b ON b.bill_1c=j.doc_base_num
			LEFT JOIN LegPers lp ON lp.1c_id=b.client_1c
			LEFT JOIN CLIENTS cb ON cb.ID=lp.client_id
			LEFT JOIN (
			SELECT
			ji.ID, CONCAT(p.pkey,'-',issuenum) 'Key', ji.SUMMARY, ist.pname 'Status',
			ExtractValue(cfo.TEXTVALUE,'/content/value') 'Client', cf1c.STRINGVALUE
			FROM jiradb.jiraissue ji
			LEFT JOIN jiradb.issuestatus ist ON ist.ID=ji.issuestatus
			LEFT JOIN jiradb.project p ON p.ID=ji.PROJECT
			LEFT JOIN jiradb.customfieldvalue cfo ON cfo.ISSUE=ji.ID AND cfo.CUSTOMFIELD=11901
			LEFT JOIN jiradb.customfieldvalue cf1c ON cf1c.ISSUE=ji.ID AND cf1c.CUSTOMFIELD=10900
			WHERE ji.issuetype IN (10,12400,14200) AND CREATED >= '2019-08-01') Jira ON Jira.STRINGVALUE LIKE CONCAT('%',bill_1c,'%')
			LEFT JOIN CLIENTS ci ON ci.ID=Jira.Client
			WHERE j.doc_date >= '2020-01-01' AND j.doc_type = 'Реализация') Rlz
		LEFT JOIN jiradb.cwd_user cuh ON cuh.user_name=HEAD_MANAGER
		LEFT JOIN jiradb.cwd_user cum ON cum.user_name=MANAGER
		LEFT JOIN jiradb.cwd_user cul ON cul.user_name=LOC_MAN
		LEFT JOIN tsddb.CLIENTS cf ON cf.ID=FinID
		LEFT JOIN tsddb.crm_percents cpg ON cpg.crm_id = cf.TYPE_TABLE AND cpg.type='global'
		LEFT JOIN tsddb.crm_percents cpm ON cpm.crm_id = cf.ID`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			result(null, { pointsX: res[0].pointsX, points: res[0].points })
		})
}
User.getBonusProfit = (result) => {
	db.query(
		`SELECT Rlz.bill_1c, Rlz.project_1c, Rlz.doc_num, Rlz.doc_date, Rlz.client_1c, Rlz.client_name, Rlz.doc_sum,
			cuh.email_address HeadManager, cum.email_address Manager, cul.email_address LocalManager,
			Rlz.Key, Rlz.Status, Rlz.Client, IFNULL(Rlz.Client,CONCAT(Rlz.client_name,' *')) ClientFin,
			ROUND(Rlz.2p*IF(Rlz.doc_sum/PriceProfit-Rlz.doc_sum*REPLACE(IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV),',','.')>0,
			ROUND(Rlz.doc_sum/PriceProfit-Rlz.doc_sum*REPLACE(IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV),',','.'),2),0),2) hmp,
			ROUND(Rlz.5p*IF(Rlz.doc_sum/PriceProfit-Rlz.doc_sum*REPLACE(IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV),',','.')>0,
			ROUND(Rlz.doc_sum/PriceProfit-Rlz.doc_sum*REPLACE(IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV),',','.'),2),0),2) mp,
			ROUND(Rlz.3p*IF(Rlz.doc_sum/PriceProfit-Rlz.doc_sum*REPLACE(IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV),',','.')>0,
			ROUND(Rlz.doc_sum/PriceProfit-Rlz.doc_sum*REPLACE(IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV),',','.'),2),0),2) lmp,
			ROUND(Rlz.3p*IF(Rlz.Key IS NULL,0,IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV)),2) lmpX,
			CONCAT('SERV',IF(cpm.AIDC_SERV IS NULL,'',' *')) Type
		FROM (
			SELECT b.bill_1c, b.project_1c, j.doc_num, j.doc_date, b.client_1c, lp.client_name, j.doc_sum,
			Jira.Key, Jira.Status, ci.NAME Client, 0.12 2p, 0.05 5p, 0.03 3p, IFNULL(ci.ID,cb.ID) FinID,
			Jira.Spec, Specs.SpecID, Specs.Vi, Specs.Sm, Specs.Buh, Profit.PriceProfit, Profit.Perc
			FROM 1C_Journal_1 j
			LEFT JOIN 1C_Bills_1 b ON b.bill_1c=j.doc_base_num
			LEFT JOIN LegPers lp ON lp.1c_id=b.client_1c
			LEFT JOIN CLIENTS cb ON cb.ID=lp.client_id
			LEFT JOIN (
			SELECT
			ji.ID, CONCAT(p.pkey,'-',issuenum) 'Key', ji.SUMMARY, ist.pname 'Status',
			ExtractValue(cfo.TEXTVALUE,'/content/value') 'Client', cf1c.STRINGVALUE, ExtractValue(cfs.TEXTVALUE,'/content/value') Spec
			FROM jiradb.jiraissue ji
			LEFT JOIN jiradb.issuestatus ist ON ist.ID=ji.issuestatus
			LEFT JOIN jiradb.project p ON p.ID=ji.PROJECT
			LEFT JOIN jiradb.customfieldvalue cfo ON cfo.ISSUE=ji.ID AND cfo.CUSTOMFIELD=11901
			LEFT JOIN jiradb.customfieldvalue cf1c ON cf1c.ISSUE=ji.ID AND cf1c.CUSTOMFIELD=10900
			LEFT JOIN jiradb.customfieldvalue cfs ON cfs.ISSUE=ji.ID AND cfs.CUSTOMFIELD=22608
			WHERE ji.issuetype IN (12400,14200) AND CREATED >= '2019-08-01') Jira ON Jira.STRINGVALUE LIKE CONCAT('%',bill_1c,'%')
			LEFT JOIN CLIENTS ci ON ci.ID=Jira.Client
			LEFT JOIN (
			SELECT ji.ID SpecID, C.ID CLI_ID, C.NAME CLIENT, it.pname DOG_TYPE, isst.pname STATUS,
			cfvvi.STRINGVALUE Vi, cfvsm.STRINGVALUE Sm, cfvb.STRINGVALUE Buh, jid.ID DogID, cfvnd.STRINGVALUE NOM_DOG, cfvp.TEXTVALUE PosID
			FROM jiradb.jiraissue ji
			LEFT JOIN jiradb.issuetype it ON it.ID = ji.issuetype
			LEFT JOIN jiradb.issuestatus isst ON isst.ID = ji.issuestatus
			LEFT JOIN jiradb.issuelink il ON il.DESTINATION=ji.ID AND il.LINKTYPE=10100
			LEFT JOIN jiradb.customfieldvalue cfvop ON cfvop.ISSUE=ji.ID AND cfvop.CUSTOMFIELD=20822
			LEFT JOIN jiradb.customfieldvalue cfvvi ON cfvvi.ISSUE=ji.ID AND cfvvi.CUSTOMFIELD=21926
			LEFT JOIN tsddb.CLIENTS C ON C.ID = ExtractValue(cfvop.TEXTVALUE,'/content/value')
			LEFT JOIN jiradb.jiraissue jid ON jid.ID=il.SOURCE
			LEFT JOIN jiradb.customfieldvalue cfvnd ON cfvnd.ISSUE=jid.ID AND cfvnd.CUSTOMFIELD=21300
			LEFT JOIN jiradb.customfieldvalue cfvp ON cfvp.ISSUE=jid.ID AND cfvp.CUSTOMFIELD=23301
			LEFT JOIN jiradb.customfieldvalue cfvb ON cfvb.ISSUE=jid.ID AND cfvb.CUSTOMFIELD=22704
			LEFT JOIN jiradb.customfieldvalue cfvsm ON cfvsm.ISSUE=jid.ID AND cfvsm.CUSTOMFIELD=22705
			WHERE ji.PROJECT=15700 AND ji.issuetype IN (13600,14401) AND ji.issuestatus!=6
			) Specs ON Jira.Spec=Specs.SpecID
			LEFT JOIN (
			SELECT SOURCE,
			ROUND(SUM(ExtractValue(IFNULL(cfstk.TEXTVALUE,cfst.TEXTVALUE),'/content/value'))) Price,
			ROUND(SUM(IF(ji.issuetype=14500,0,ExtractValue(cfseb.TEXTVALUE,'/content/value')))) Cost,
			ROUND(SUM(IF(ji.issuetype=14500,ExtractValue(IFNULL(cfstk.TEXTVALUE,cfst.TEXTVALUE),'/content/value'),ExtractValue(cfpr.TEXTVALUE,'/content/value')))) Profit,
			ROUND((SUM(ExtractValue(IFNULL(cfstk.TEXTVALUE,cfst.TEXTVALUE),'/content/value'))-SUM(IF(ji.issuetype=14500,0,ExtractValue(cfseb.TEXTVALUE,'/content/value'))))/SUM(IF(ji.issuetype=14500,0,ExtractValue(cfseb.TEXTVALUE,'/content/value')+IF(ji.issuetype=14500,0,IFNULL(cfs.NUMBERVALUE,0))))*100,2) Perc,ROUND(SUM(ExtractValue(IFNULL(cfstk.TEXTVALUE,cfst.TEXTVALUE),'/content/value'))/SUM(IF(ji.issuetype=14500,ExtractValue(IFNULL(cfstk.TEXTVALUE,cfst.TEXTVALUE),'/content/value'),ExtractValue(cfpr.TEXTVALUE,'/content/value'))),2) PriceProfit
			FROM jiradb.issuelink il
			LEFT JOIN jiradb.customfieldvalue cfst ON cfst.ISSUE=il.DESTINATION AND cfst.CUSTOMFIELD=15601
			LEFT JOIN jiradb.customfieldvalue cfstk ON cfstk.ISSUE=il.DESTINATION AND cfstk.CUSTOMFIELD=23200
			LEFT JOIN jiradb.customfieldvalue cfseb ON cfseb.ISSUE=il.DESTINATION AND cfseb.CUSTOMFIELD=22605
			LEFT JOIN jiradb.customfieldvalue cfpr ON cfpr.ISSUE=il.DESTINATION AND cfpr.CUSTOMFIELD=22606
			LEFT JOIN jiradb.customfieldvalue cfs ON cfs.ISSUE=il.DESTINATION AND cfs.CUSTOMFIELD=23008
			LEFT JOIN jiradb.jiraissue ji ON ji.ID=il.DESTINATION
			WHERE LINKTYPE=10100 AND (issuestatus != 6 OR issuetype = 12401)
			GROUP BY SOURCE) Profit ON Profit.SOURCE=Jira.ID
			WHERE j.doc_date >= '2020-01-01' AND j.doc_type = 'Реализация' AND project_1c IN ('Ремонт', 'Сервисный контракт', 'Сервисный контракт (ФИКС)', 'Ремонт (ФИКС)', 'Аренда Оборудования', 'СКС')) Rlz
		LEFT JOIN tsddb.CLIENTS cf ON cf.ID=FinID
		LEFT JOIN jiradb.app_user au ON au.user_key=Rlz.Vi
		LEFT JOIN jiradb.cwd_user cum ON cum.user_name=au.lower_user_name
		LEFT JOIN jiradb.cwd_user cuh ON cuh.user_name=IFNULL(cf.SM_SERV,Rlz.Sm)
		LEFT JOIN jiradb.cwd_user cul ON cul.user_name=Rlz.Buh
		LEFT JOIN tsddb.crm_percents cpg ON cpg.crm_id = cf.TYPE_TABLE AND cpg.type='global'
		LEFT JOIN tsddb.crm_percents cpm ON cpm.crm_id = cf.ID`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			result(null, res)
		})
}
User.getBonusProfitSum = (email, result) => {
	db.query(
		`SELECT 
			SUM(
			IF(cuh.email_address=${email},
			ROUND(Rlz.2p*IF(Rlz.doc_sum/PriceProfit-Rlz.doc_sum*REPLACE(IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV),',','.')>0,
			ROUND(Rlz.doc_sum/PriceProfit-Rlz.doc_sum*REPLACE(IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV),',','.'),2),0),2),
			0)+
			IF(cum.email_address=${email},
			ROUND(Rlz.5p*IF(Rlz.doc_sum/PriceProfit-Rlz.doc_sum*REPLACE(IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV),',','.')>0,
			ROUND(Rlz.doc_sum/PriceProfit-Rlz.doc_sum*REPLACE(IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV),',','.'),2),0),2),
			0)+
			IF(cul.email_address=${email},
			ROUND(Rlz.3p*IF(Rlz.doc_sum/PriceProfit-Rlz.doc_sum*REPLACE(IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV),',','.')>0,
			ROUND(Rlz.doc_sum/PriceProfit-Rlz.doc_sum*REPLACE(IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV),',','.'),2),0),2),
			0)) pointsX,
			Sum(
			ROUND(Rlz.3p*IF(Rlz.Key IS NULL,0,IFNULL(cpm.AIDC_SERV,cpg.AIDC_SERV)),2)) points
			FROM (
			SELECT b.bill_1c, b.project_1c, j.doc_num, j.doc_date, b.client_1c, lp.client_name, j.doc_sum,
			Jira.Key, Jira.Status, ci.NAME Client, 0.12 2p, 0.05 5p, 0.03 3p, IFNULL(ci.ID,cb.ID) FinID,
			Jira.Spec, Specs.SpecID, Specs.Vi, Specs.Sm, Specs.Buh, Profit.PriceProfit, Profit.Perc
			FROM 1C_Journal_1 j
			LEFT JOIN 1C_Bills_1 b ON b.bill_1c=j.doc_base_num
			LEFT JOIN LegPers lp ON lp.1c_id=b.client_1c
			LEFT JOIN CLIENTS cb ON cb.ID=lp.client_id
			LEFT JOIN (
			SELECT
			ji.ID, CONCAT(p.pkey,'-',issuenum) 'Key', ji.SUMMARY, ist.pname 'Status',
			ExtractValue(cfo.TEXTVALUE,'/content/value') 'Client', cf1c.STRINGVALUE, ExtractValue(cfs.TEXTVALUE,'/content/value') Spec
			FROM jiradb.jiraissue ji
			LEFT JOIN jiradb.issuestatus ist ON ist.ID=ji.issuestatus
			LEFT JOIN jiradb.project p ON p.ID=ji.PROJECT
			LEFT JOIN jiradb.customfieldvalue cfo ON cfo.ISSUE=ji.ID AND cfo.CUSTOMFIELD=11901
			LEFT JOIN jiradb.customfieldvalue cf1c ON cf1c.ISSUE=ji.ID AND cf1c.CUSTOMFIELD=10900
			LEFT JOIN jiradb.customfieldvalue cfs ON cfs.ISSUE=ji.ID AND cfs.CUSTOMFIELD=22608
			WHERE ji.issuetype IN (12400,14200) AND CREATED >= '2019-08-01') Jira ON Jira.STRINGVALUE LIKE CONCAT('%',bill_1c,'%')
			LEFT JOIN CLIENTS ci ON ci.ID=Jira.Client
			LEFT JOIN (
			SELECT ji.ID SpecID, C.ID CLI_ID, C.NAME CLIENT, it.pname DOG_TYPE, isst.pname STATUS,
			cfvvi.STRINGVALUE Vi, cfvsm.STRINGVALUE Sm, cfvb.STRINGVALUE Buh, jid.ID DogID, cfvnd.STRINGVALUE NOM_DOG, cfvp.TEXTVALUE PosID
			FROM jiradb.jiraissue ji
			LEFT JOIN jiradb.issuetype it ON it.ID = ji.issuetype
			LEFT JOIN jiradb.issuestatus isst ON isst.ID = ji.issuestatus
			LEFT JOIN jiradb.issuelink il ON il.DESTINATION=ji.ID AND il.LINKTYPE=10100
			LEFT JOIN jiradb.customfieldvalue cfvop ON cfvop.ISSUE=ji.ID AND cfvop.CUSTOMFIELD=20822
			LEFT JOIN jiradb.customfieldvalue cfvvi ON cfvvi.ISSUE=ji.ID AND cfvvi.CUSTOMFIELD=21926
			LEFT JOIN tsddb.CLIENTS C ON C.ID = ExtractValue(cfvop.TEXTVALUE,'/content/value')
			LEFT JOIN jiradb.jiraissue jid ON jid.ID=il.SOURCE
			LEFT JOIN jiradb.customfieldvalue cfvnd ON cfvnd.ISSUE=jid.ID AND cfvnd.CUSTOMFIELD=21300
			LEFT JOIN jiradb.customfieldvalue cfvp ON cfvp.ISSUE=jid.ID AND cfvp.CUSTOMFIELD=23301
			LEFT JOIN jiradb.customfieldvalue cfvb ON cfvb.ISSUE=jid.ID AND cfvb.CUSTOMFIELD=22704
			LEFT JOIN jiradb.customfieldvalue cfvsm ON cfvsm.ISSUE=jid.ID AND cfvsm.CUSTOMFIELD=22705
			WHERE ji.PROJECT=15700 AND ji.issuetype IN (13600,14401) AND ji.issuestatus!=6
			) Specs ON Jira.Spec=Specs.SpecID
			LEFT JOIN (
			SELECT SOURCE,
			ROUND(SUM(ExtractValue(IFNULL(cfstk.TEXTVALUE,cfst.TEXTVALUE),'/content/value'))) Price,
			ROUND(SUM(IF(ji.issuetype=14500,0,ExtractValue(cfseb.TEXTVALUE,'/content/value')))) Cost,
			ROUND(SUM(IF(ji.issuetype=14500,ExtractValue(IFNULL(cfstk.TEXTVALUE,cfst.TEXTVALUE),'/content/value'),ExtractValue(cfpr.TEXTVALUE,'/content/value')))) Profit,
			ROUND((SUM(ExtractValue(IFNULL(cfstk.TEXTVALUE,cfst.TEXTVALUE),'/content/value'))-SUM(IF(ji.issuetype=14500,0,ExtractValue(cfseb.TEXTVALUE,'/content/value'))))/
				SUM(IF(ji.issuetype=14500,0,ExtractValue(cfseb.TEXTVALUE,'/content/value')+IF(ji.issuetype=14500,0,IFNULL(cfs.NUMBERVALUE,0))))*100,2) Perc,
			ROUND(SUM(ExtractValue(IFNULL(cfstk.TEXTVALUE,cfst.TEXTVALUE),'/content/value'))/
				SUM(IF(ji.issuetype=14500,ExtractValue(IFNULL(cfstk.TEXTVALUE,cfst.TEXTVALUE),'/content/value'),ExtractValue(cfpr.TEXTVALUE,'/content/value'))),2) PriceProfit
			FROM jiradb.issuelink il
			LEFT JOIN jiradb.customfieldvalue cfst ON cfst.ISSUE=il.DESTINATION AND cfst.CUSTOMFIELD=15601
			LEFT JOIN jiradb.customfieldvalue cfstk ON cfstk.ISSUE=il.DESTINATION AND cfstk.CUSTOMFIELD=23200
			LEFT JOIN jiradb.customfieldvalue cfseb ON cfseb.ISSUE=il.DESTINATION AND cfseb.CUSTOMFIELD=22605
			LEFT JOIN jiradb.customfieldvalue cfpr ON cfpr.ISSUE=il.DESTINATION AND cfpr.CUSTOMFIELD=22606
			LEFT JOIN jiradb.customfieldvalue cfs ON cfs.ISSUE=il.DESTINATION AND cfs.CUSTOMFIELD=23008
			LEFT JOIN jiradb.jiraissue ji ON ji.ID=il.DESTINATION
			WHERE LINKTYPE=10100 AND (issuestatus != 6 OR issuetype = 12401)
			GROUP BY SOURCE) Profit ON Profit.SOURCE=Jira.ID
			WHERE j.doc_date >= '2020-01-01' AND j.doc_type = 'Реализация' AND project_1c IN ('Ремонт', 'Сервисный контракт', 'Сервисный контракт (ФИКС)', 'Ремонт (ФИКС)', 'Аренда Оборудования', 'СКС')) Rlz
			LEFT JOIN tsddb.CLIENTS cf ON cf.ID=FinID
			LEFT JOIN jiradb.app_user au ON au.user_key=Rlz.Vi
			LEFT JOIN jiradb.cwd_user cum ON cum.user_name=au.lower_user_name
			LEFT JOIN jiradb.cwd_user cuh ON cuh.user_name=IFNULL(cf.SM_SERV,Rlz.Sm)
			LEFT JOIN jiradb.cwd_user cul ON cul.user_name=Rlz.Buh
			LEFT JOIN tsddb.crm_percents cpg ON cpg.crm_id = cf.TYPE_TABLE AND cpg.type='global'
			LEFT JOIN tsddb.crm_percents cpm ON cpm.crm_id = cf.ID`,
		(err, res) => {
			if (err) {
				console.log('Error: ', err)
				result(null, err)
				return
			}
			result(null, { pointsX: res[0].pointsX, points: res[0].points })
		})
}

module.exports = User
