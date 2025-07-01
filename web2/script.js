let opcaoAtiva = 1;

document.querySelectorAll('.inputs input, .content-header input').forEach(input => {
    input.addEventListener('input', atualizarTexto);
});

function mostrarInfo(opcao) {
    opcaoAtiva = opcao;

    let slot1 = document.getElementById("slot1").value || "1";
    let slot2 = document.getElementById("slot2").value || "7";
    let onu = document.getElementById("onu").value || "55";
    let serial = document.getElementById("serial").value || "DACMECEC5C2EE";
    let numero = document.getElementById("numero").value || "558420204039";
    let pin = document.getElementById("pin").value || "541625533630007552";
    let desc = document.getElementById("desc").value || "FGA2210";
    let service_port = document.getElementById("service_port").value || "**Service port**";
    let vlan = document.getElementById("vlan").value || "**VLAN**";

    let slot = `${slot1}/${slot2}`;
    let slot1Formatado = ajustarNumero(slot1);
    let slot2Formatado = ajustarNumero(slot2);
    let onuFormatado = ajustarNumero(onu);

    let equip = 3;
    if (serial.toLowerCase().includes("znts")) {
        equip = 4;
    } else if (serial.toLowerCase().startsWith("alcl")) {
        equip = 14;
    } else if (serial.toLowerCase().startsWith("zyxe")) {
        equip = 3;
    }

    let info = gerarTexto(opcao, slot, onu, serial, slot1, slot2, service_port, vlan, equip, numero, pin, onuFormatado, onu, slot2Formatado, slot1Formatado, desc);

    document.getElementById("infoText").value = info;

    const barra = document.getElementById("barraSuperior");
    barra.style.display = (opcao === 1 || opcao === 5) ? "flex" : "none";

    let buttons = document.querySelectorAll(".sidebar button");
    buttons.forEach(button => button.classList.remove("active"));
    if (buttons[opcao - 1]) {
        buttons[opcao - 1].classList.add("active");
    }
}

function atualizarTexto() {
    mostrarInfo(opcaoAtiva);
}

function ajustarNumero(numero) {
    numero = numero.trim();
    if (!isNaN(numero) && numero.length === 1) {
        return "0" + numero;
    }
    return numero;
}

function gerarTexto(opcao, slot, onu, serial, slot1, slot2, service_port, vlan, equip, numero, pin, onuFormatado, onuRaw, slot2Formatado, slot1Formatado, desc) {
    const textos = {

        // Adicione os blocos de comando aqui conforme opção
             1: ` #################### PROVISIONAR DATACOM #####################
    
config terminal
interface gpon 1/${slot}  
onu ${onu}
name 3663018
serial-number ${serial}
line-profile ${vlan}_1000_b
ethernet 1
negotiation
no shutdown
native vlan vlan-id ${vlan}
commit

exit

service-port new

gpon 1/${slot} onu ${onu} gem 2 description 3663018 match vlan vlan-id ${vlan} action vlan replace vlan-id ${vlan}
commit
 
##################### DESPROVISIONAR #####################

config
    interface gpon 1/${slot} 
    no onu ${onu} 
    top
    no service-port ${onu}
    commit

    exit


##################### VERIFICAR INFORMAÇÕES #####################


show interface gpon discovered-onus	ONUS DESPROVISIONADAS

show interface gpon onu | include ${serial}	CONSULTAR ONU

show service-port gpon 1/${slot}	CONSULTAR SERVICE PORT 

show interface gpon 1/${slot} onu ${onu}	LISTAR ONUS


`,

          2: `####################### PROVISIONAR NOKIA #######################

configure equipment ont interface 1/1/${slot}/${onu} sernum ${serial} subslocid WILDCARD fec-up disable sw-dnload-version disabled sw-ver-pland disabled voip-allowed iphost iphc-allowed enable

---------------

configure equipment ont interface 1/1/${slot}/${onu} sernum ${serial} subslocid WILDCARD fec-up disable sw-dnload-version auto sw-ver-pland auto voip-allowed iphost pland-cfgfile1 auto pland-cfgfile2 auto dnload-cfgfile1 auto dnload-cfgfile2 auto desc1 "${desc}"


configure equipment ont interface 1/1/${slot}/${onu} admin-state up
configure qos interface ont:1/1/${slot}/${onu} ds-queue-sharing
configure equipment ont slot 1/1/${slot}/${onu}/${equip} plndnumdataports 1 plndnumvoiceports 0 planned-card-type veip admin-state up
configure qos interface 1/1/${slot}/${onu}/${equip}/1 upstream-queue 0 bandwidth-profile name:vel_1000M_1000M_IN
configure qos interface ont:1/1/${slot}/${onu} queue 0 shaper-profile name:vel_1000M_1000M_OUT
configure bridge port 1/1/${slot}/${onu}/${equip}/1 max-unicast-mac 3
configure bridge port 1/1/${slot}/${onu}/${equip}/1 vlan-id 301 tag single-tagged
configure interface port uni:1/1/${slot}/${onu}/${equip}/1 admin-up


####################### DESPROVISIONAMENTO #######################


configure equipment ont interface 1/1/${slot}/${onu} admin-state down
configure equipment ont no interface 1/1/${slot}/${onu}


####################### CONSULTA #######################


show equipment ont optics 1/1/${slot}/${onu}


show vlan bridge-port-fdb 1/1/${slot}/${onu}/${equip}/1

show dhcp-relay session vlanport:1/1/${slot}/${onu}/${equip}/1:301
show dhcp-relay session vlanport:1/1/${slot}/${onu}/${equip}/1:299
show dhcp-relay session vlanport:1/1/${slot}/${onu}/${equip}/1:298
show dhcp-relay session vlanport:1/1/${slot}/${onu}/vuni:298

show equipment ont status pon 1/1/${slot} ont 1/1/${slot}/${onu}


####################### ATIVAÇÃO TV #######################
	  ⚠️⚠️⚠️ ENVIAR LINHA POR LINHA ⚠️⚠️⚠️ 


configure qos interface 1/1/${slot}/${onu}/${equip}/1 upstream-queue 3 bandwidth-profile name:vel_100M_1M_UP

configure qos interface ont:1/1/${slot}/${onu} queue 3 shaper-profile name:vel_100M_1M_DOWN

configure bridge port 1/1/${slot}/${onu}/${equip}/1 vlan-id 299 tag single-tagged

configure igmp channel vlan:1/1/${slot}/${onu}/${equip}/1:299 max-num-group 10


##################### ATIVAÇÃO TELEFONIA #####################
  ⚠️⚠️⚠️ CASO ERRO, TENTAR ENVIAR LINHA POR LINHA ⚠️⚠️⚠️ 

configure qos interface 1/1/${slot}/${onu}/voip upstream-queue 2 bandwidth-profile name:vel_1M_1M_IN
configure equipment ont slot 1/1/${slot}/${onu}/2 plndnumdataports 0 plndnumvoiceports 2 planned-card-type pots admin-state down
configure bridge port 1/1/${slot}/${onu}/vuni max-unicast-mac 2
configure bridge port 1/1/${slot}/${onu}/vuni vlan-id 298
configure bridge port 1/1/${slot}/${onu}/vuni pvid 298
configure iphost ont ont:1/1/${slot}/${onu}/1 dhcp enabled vlan 298
configure iphost ont ont:1/1/${slot}/${onu}/1 admin-state up
configure voice ont voip-config ont:1/1/${slot}/${onu}/1 protocol sip
configure voice ont sip-config ont:1/1/${slot}/${onu}/1 proxyserv-prof 2 aor-host-prt-prof 3 registrar-prof 2 reg-expire-time 1800 uri-format sip-uri
configure interface port voip:1/1/${slot}/${onu} admin-up
configure equipment ont slot 1/1/${slot}/${onu}/2 admin-state up
configure voice ont voice-port 1/1/${slot}/${onu}/2/1 admin-state locked
configure voice ont voice-port 1/1/${slot}/${onu}/2/1 custinfo POTS1 voipconfig sip pots-pwr-timer 300 rx-gain 1.000000 tx-gain 2.000000 impedance 600 voip-media-prof 1
configure voice ont voice-sip-port 1/1/${slot}/${onu}/2/1 user-aor ${numero} display-name ${numero} user-name ${numero} password plain:${pin} voice-mail-prof 2 ntwk-dp-prof 1 app-serv-prof 1 ac-code-prof 1
configure voice ont voice-port 1/1/${slot}/${onu}/2/1 admin-state unlocked




`,
                3: `####################### COMANDOS CALIX #######################


Calix: 
show ont serial-number ${serial}

Verificar ont não provisionada:
show ont unassigned
 
Verificar ONT pelo FSAN:
show ont serial-number (CXNK) ${serial}

Verificar ONTs pela posição:
show ont discovered on-gpon-port ${slot}
 
Verificar detalhes de todas as ONTs:
show ont discovered detail
 
Verificar detalhes de ONT específica:
show ont 59${slot1Formatado}${slot2Formatado}${onuFormatado} detail
 
Verificar VLAN de ONT:
show ont 59${slot1Formatado}${slot2Formatado}${onuFormatado} vlans
 
Verificar posição de ONT ID:
show ont 59${slot1Formatado}${slot2Formatado}${onuFormatado} ont-pon-us-cos
 
Verificar IP:
show dhcp leases
 
Verificar IP em uma ONT especifica:
show dhcp leases ont-port 59${slot1Formatado}${slot2Formatado}${onuFormatado}/G1 detail
 
VERIFICAR ONTs NA PON:
show ont on-gpon-port ${slot}
 
Habilitar Gerência:
set ont-port 59${slot1Formatado}${slot2Formatado}${onuFormatado}/G1 remote-access-time 1440
 
VERIFICAR TODAS AS INFORMAÇÕES DAS ONTs NA PON:
show ont on-gpon-port ${slot} detail
 
VERIFICAR PORTÊNCIAS NAS ONTs DA PON:
show ont on-gpon-port "${slot}" real-time-data
 
Reiniciar ONT:
reset ont 59${slot1Formatado}${slot2Formatado}${onuFormatado}
 
Habilitar acesso remoto:
set ont-port 59${slot1Formatado}${slot2Formatado}${onuFormatado}/G1 remote-access-time 1440


####################### DESPROVISIONAR #######################

delete ont 59${slot1Formatado}${slot2Formatado}${onuFormatado} forced


####################### PROVISIONAMENTO #######################

create ont 59${slot1Formatado}${slot2Formatado}${onuFormatado} profile 844G-L3 serial-number ${serial} admin-state enabled
set ont-port 59${slot1Formatado}${slot2Formatado}${onuFormatado}/G1 mgmt-mode external instance rg-3
set ont-port 59${slot1Formatado}${slot2Formatado}${onuFormatado}/G1 rg-mgmt-profile Rg-Mgmt-Prof-1
add eth-svc Data1 to-ont-port 59${slot1Formatado}${slot2Formatado}${onuFormatado}/G1 bw-profile 1000991000 svc-tag-action TA-V-301-L3 admin-state enabled
set ont-port 59${slot1Formatado}${slot2Formatado}${onuFormatado}/G1 eth-svc Data1 bw-profile 1000991000
remove ont-port 59${slot1Formatado}${slot2Formatado}${onuFormatado}/g2 from-res-gw
add eth-svc Data3 to-ont-port 59${slot1Formatado}${slot2Formatado}${onuFormatado}/g2 bw-profile PHONE-E1 svc-tag-action TA-V-298-L2 admin-state enabled


####################### COMANDO MULTICAST #######################

add eth-svc Data2 to-ont-port 59${slot1Formatado}${slot2Formatado}${onuFormatado}/G1 bw-profile IPTV svc-tag-action TA-V-299 mcast-profile IPTV-MCast-Prof-1 admin-state enabled



`,
                4: `####################### COMANDOS ZHONE #######################

Listar card/pon
onu status ${slot}

Listar desprovisionadas
onu show ${slot}

Velocidade clientes
onu gemports ${slot}/${onu}

Verificar potencia/modelo ONT
onu inventory ${slot}/${onu}

Consultar potencia
onu status ${slot}/${onu}

Mostra se está UP e se pegou IP
bridge show 1-${slot1}-${slot2}-${onu}

Buscar ONU pelo serial
onu find fsan ${serial}

####################### COMANDO PARA CRIAR VLAN 301 ZHONE #######################


onu set ${slot}/${onu} vendorid ZNTS serno fsan ${serial} meprof TECH_FGA2232_R genprof TECH_FGA2232_R
gpononu profile create spec ${slot}/${onu} TECH_FGA2232_R TECH_FGA2232_R

-----------------

onu set ${slot}/${onu} vendorid ZNTS serno fsan ${serial} meprof VANT_FGA225C_R genprof VANT_FGA225C_R
gpononu profile create spec ${slot}/${onu}  VANT_FGA225C_R VANT_FGA225C_R

-----------------

bridge add 1-${slot1}-${slot2}-${onu}/gpononu gem 9${onuFormatado} gtp 100881 downlink-video vlan 299 tagged video 0/10 ipktrule 9 epktrule 100881
bridge add 1-${slot1}-${slot2}-${onu}/gpononu gem 5${onuFormatado} gtp 1000991000 downlink vlan 301 tagged ipktrule 5 epktrule 1000991000 maxunicast 3
bridge add 1-${slot1}-${slot2}-${onu}/gpononu gem 7${onuFormatado} gtp 700 downlink-voice vlan 298 tagged ipktrule 7
onu resync 1-${slot1}-${slot2}-${onu}


####################### DELETAR #######################


onu delete ${slot}/${onu}
-------
Ok to delete ONU ${slot}/${onu} and all of its configuration? [yes] or [no]:    yes
Do you want to exit from this request? [yes] or [no]:    no
Are you sure? [yes] or [no]:   yes
-------

`,

                5: ` ####################### DESPROVISIONAR HUAWEI #######################

display ont autofind all		consultar ONU desprovisionadas


enable  


config 


display ont info by-sn ${serial}	consultar onde a equipamento está provisionamento


undo service-port port 0/${slot} ont ${onu} 


interface gpon 0/${slot1}


ont delete ${slot2} ${onu}


quit
--------------------------------------------------------------------------

	display ont info by-sn 485754434C098DAA 								
  		F/S/P: 0/1/22 (Chassi / card [placa] / porta pon)			
  		ONT-ID: 333	(ID da onu)

--------------------------------------------------------------------------

####################### PROVISIONAMENTO #######################
--------------------------------------------------
pegar service-port

display service-port next-free-index
--------------------------------------------------

enable

config

interface gpon 0/${slot1}

ont add ${slot2} ${onu} sn-auth ${serial} omci ont-lineprofile-id ${vlan} ont-srvprofile-id ${vlan} desc ${serial}

ont port native-vlan ${slot2} ${onu} eth 1 vlan ${vlan} priority 0
quit
 
service-port ${service_port} vlan ${vlan} gpon 0/${slot1}/${slot2} ont ${onu} gemport ${vlan} multi-service user-vlan ${vlan} tag-transform translate


`,

                0: `####################### CHAMADO GSOP #######################

Contrato: 33438951

Chat: 305629859 

Nome Assinante: RITA MARIA GONCALVES

Cidade: MOGI MIRIM/SP

Serial equipamento: ALCLB3EA3E76

Tecnologia: Fibra FTTH

Problema apresentado: Equipamento não sobe conexão IP
comando de provisionamento é enviado, sobe VLAN, porém não pega IP
enviado comando manualmente pela OLT, sem sucesso
alterado equipamento, provisionado sem sucesso

Validado sinal da fibra, ok

Anexado fotos do sinal.

Foi realizada a troca da ONU recente? Quais?

Realizado a troca 

ALCLB3EA1F2C e ALCLB3EA3E76

Validado que não existe RUIE aberta que impacte o cliente:

Sem evento massivo
`,



    };

    return textos[opcao] || "Selecione uma opção.";
}
