��    E      D  a   l      �     �  
     
          
   *  	   5     ?     _      n     �     �     �     �  	   �  �  �  S  u  �  �	  C   �  �    7  �  b     c   g     �     �  	  �  4   �     '     ,     5     P     f     }    �  :   �  #   �  �   �  �   �  �   W  �   C  �   B  	   �     �     �     �     
       D   "  �   g  �     {     >        �  z   �  $   K   �   p   �   ,!  '   �!  �   �!     �"  �   �"  R   H#     �#     �#     �#     �#     �#     �#     $  �  $     �%  
   �%  
   �%     �%     �%  	   &  "   &     /&  '   G&  '   o&     �&     �&     �&  	   �&  �  �&  u  �(  �   *  F   �-  Q  �-  [  I5  x   �6  j   7     �7     �7  ]  �7  4   
9     ?9     D9     M9     h9     ~9     �9  "  �9  A   �:  -   ;  �   /;  �   "<  (  �<  2  �=  �   ?     �?     �?     �?     �?     �?     �?  J   �?  �   @@    �@  �   �A  >   gB     �B  �   �B  $   BC  �   gC  �   PD  -   �D  �   E  	   �E  �   �E  Y   ~F     �F  
   �F     �F      G     G  	   &G     0G         >      1              C   9      8                  !       (           4           :   "                    #   @   	      <               '          2          A       ,   .   7   
   +               6      ;          %   E       *                D   =                  0   -              3      ?   B                    $   )   5      &      /       ## Company Information ## Contact ## Cookies ## Features ## Logging ## Matomo ## Responsible for the content: ### Data Usage ### How Can You Disable Cookies? ### How Long Is It Stored? ### IP Abbreviation ### What Is Stored? ### What are Cookies? %B, %e %Y * E-Invoice generation from popular Spreadsheet formats or JSON.
* Supports all electronic invoice formats conforming to EU standard EN16931, notably Factur-X/ZUGFeRD, UBL, and CII.
* Written in TypeScript/JavaScript.
* Large parts of the code are generated from PEPPOL-UBL documentation.
* Automatic valdiation of input document structure.
* OpenAPI/Swagger API documentation included. * The documentation is browsable and relatively easy to understand.
* It is generated from data (see https://github.com/OpenPEPPOL/peppol-bis-invoice-3) that also allows generating [JSON schema](https://json-schema.org/) definitions.
* From these JSON schema definitions, it is possible to generate large parts of the code of E-Invoice-EU. - Your IP address. This address identifies your computer or other device
  while you are connected to the internet. Your internet service provider
  (ISP) has the legal duty to store information about which IP address
  was assigned to which customer for a certain time in most countries.
- The date and time of the request with an accuracy of one second.
- The address of the resource.
- Information about the browser and operating systems you are using and
  their respective versions. See the documentation of your browser if you
  want to suppress sending that information.
- In case that you visited the page by clicking a link, information about
  the referring web site. See the documentation of your browser if you
  want to suppress sending that information. - email: [% config.legal.email %]
- phone: [% config.legal.phone %] <h2>Disclaimer</h2>Accountability for content<br/>The contents of our pages have been created with the utmost care. However, we cannot guarantee the contents' accuracy, completeness or topicality. According to statutory provisions, we are furthermore responsible for our own content on these web pages. In this context, please note that we are accordingly not obliged to monitor merely the transmitted or saved information of third parties, or investigate circumstances pointing to illegal activity. Our obligations to remove or block the use of information under generally applicable laws remain unaffected by this as per &sect;&sect; 8 to 10 of the Telemedia Act (TMG).<br/><br/>Accountability for links<br/>Responsibility for the content of external links (to web pages of third parties) lies solely with the operators of the linked pages. No violations were evident to us at the time of linking. Should any legal infringement become known to us, we will remove the respective link immediately.<br/><br/>Copyright<br/> Our web pages and their contents are subject to German copyright law. Unless expressly permitted by law (&sect; 44a et seq. of the copyright law), every form of utilizing, reproducing or processing works subject to copyright protection on our web pages requires the prior consent of the respective owner of the rights. Individual reproductions of a work are allowed only for private use, so must not serve either directly or indirectly for earnings. Unauthorized utilization of copyrighted works is punishable (&sect; 106 of the copyright law).<br/><br/><i>Source: </i><a href="http://www.muster-vorlagen.net" target="_blank">Create legal disclosures online - http://www.muster-vorlagen.net</a><br/><br/> All that was left to be done was to map the input spreadsheet data to elements
in the output XML of the electronic invoice. Because there are multiple
supported output XML formats, it makes sense to first map the input data
into a general internal format and then render the data into the desired
output format. All this information is stored for technical purposes only, such as analysis
of technial problems. As a result, it is easy to keep the implementation up-to-date with the current
standards by Peppol. Bulgaria<br> Cookie Settings Cookies are little pieces of information that the site sends to your
browser. The browser stores this information in a file or in memory,
and sends it back to the server with all following requests until
the cookie expires or the browser is instructed to delete it. Copyright &copy; {copyright_year} {copyright_holder} Docs Download E-Invoice-EU Documentation E-Invoice-EU Releases E-Invoice-EU on GitHub Home Like most web sites, this site stores information about every request in a
server log file, a file stored on the web server. Visiting one single page
typically results in multiple requests, for textual content, images or other
media, script files, style sheets and so on. Log files are ultimately deleted after at most six months. Manager: [% config.legal.manager %] Matomo also uses cookies (see above) for storing information
about your use of this site. The information stored in these cookies is
sent to sent to a server owned by [cantanea EOOD](https://www.cantanea.com/). Matomo does not store your full IP address but only a part of it. If your IP
address is, for example, 12.34.56.78, it will be stored as 12.34.0.0. Matomo uses the information for analyzing your usage of this site. It
compiles reports on the website activities and the audience of the site,
and provides other services concerning the use of the website and
internet usage in general. Note that suppressing your IP address does not make sense. Any server
needs it as the address to which it should send the requested data. The
purpose of the IP address is not to disrupt your privacy but it is needed
for any communication on the internet. Please see your browser's documentation for information about how to
disable cookies in general, for specific sites, or from specific sources. Read More Source code of this page Stars Stars on GitHub Start Table Of Contents The following pieces of information sent by your browser are stored: The internal format chosen is largely equivalent to that of
[Peppol UBL](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/).
The advantages are: The software was created with the assumption that many small businesses
create their invoices with the help of spreadsheet software like
[LibreOffice](https://www.libreoffice.org/). That means that the invoice data
is already available as structured data. The translation for this site is not yet ready. The parts that are not
yet translated will be displayed in English instead. This website uses Matomo, a web tracking and analysis service. Toggle navigation Typical examples for information stored in cookies are language preferences or for example the content of a shopping cart. VAT-ID [% config.legal.vat_id %]<br> You cannot download any data or information from the internet without sending
data or information first. This page tries to inform you what information
is collected related to your visit. [% FILTER $Srcset alt="Flowchart of E-Invoice-EU General Mode of Operation" %]/images/basics/general-mode-of-operation/flow-chart.webp[% END %] [% title = "Incomplete Translation!" %] descriptionFree and open source tool chain for generating EN16931 conforming invoices (Factur-X/ZUGFeRD, UBL, CII, XRechnung) from popular spreadsheet formats or JSON. descriptionImprint descriptionThe software works by mapping spreadsheet data to JSON data from which the e-invoice is generated. You can also directly generate the e-invoice from JSON. descriptionWhat private date does this site receive, and what does it use it for? overridable: titleBasics titleData Privacy titleE-Invoice-EU titleGeneral Mode of Operation titleLegal Disclosure type: Project-Id-Version: qgoda-site 0.1
Report-Msgid-Bugs-To: 'Guido Flohr <guido.flohr@cantanea.com>'
PO-Revision-Date: 2025-01-25 14:40+0200
Last-Translator: Guido Flohr <guido.flohr@cantanea.com>
Language-Team: German
Language: de
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Plural-Forms: nplurals=2; plural=(n != 1);
X-Source-Language: en
X-Generator: Poedit 3.5
 ## Informationen zur Firma ## Kontakt ## Cookies ## Features ## Protokolldateien ## Matomo ## Verantwortlich für den Inhalt: ## Verwendung der Daten ### Wie lassen sich Cookies abschalten? ### Wie lange werden Daten gespeichert? ### IP-Kürzung ### Was wird gespeichert? ### Was sind Cookies? %e. %B %Y * E-Rechnungen werden aus populären Tabellenkalkulationsformaten oder JSON generiert.
* Untertütze alle elektronischen Rechnungsformate, die dem EU-Standard EN16931 entsprechen, also Factur-X/ZUGFeRD, UBL, and CII.
* In TypeScript/JavaScript geschrieben.
* Große Teile des Programmcodes werden aus der aktuellen PEPPOL-UBL-Dokumentation generiert.
* Automatische Validierung der Eingabedokumenten-Struktur.
* OpenAPI/Swagger-API-Documentation enthalten. * Alle Teile der Dokumentation sind vollständig untereinander verlinkt und relativ einfach zu verstehen.
* Die Dokumentation wird aus Daten (see https://github.com/OpenPEPPOL/peppol-bis-invoice-3) generiert, aus denen sich [JSON-Schema-Definitionen](https://json-schema.org/) erzeugen lassen.
* Es ist möglich, große Teile der Software aus diesen Schemata zu generieren. - Die IP-Adresse. Diese Adresse identifiziert den Computer oder auch andere Geräte weltweit, solange eine Verbindung zum Internet besteht. Der Internetanbieter (Internet Service Provider ISP) unterliegt der rechtlichen Verpflichtung, die Zuordnung einer IP-Adresse zu einem individuellen Kunde für eine gewisse Zeit zu speichern.
- Datum und Uhrzeit der Anfrage mit einer Genauigkeit von einer Sekunde.
- Die Adresse der angefragten Ressource.
- Informationen über Browser und Betriebssystem und deren jeweilige Versionen. Die Dokumentation des Browsers enthält Hinweise dafür, wie sich die Übermittlung dieser Daten unterdrücken lässt.
- Wurde diese Web-Site durch Klicken eines Links annavigiert, wird in der Regel auch übermittelt, von welcher Web-Adresse (URL) aus dies geschah. Die  Dokumentation des Browsers enthält Hinweise dafür, wie sich die Übermittlung dieser Daten unterdrücken lässt. - E-mail: [% config.legal.email %]
- Telefon: [% config.legal.phone %] <h2>Haftungsausschluss</h2>
Haftung für Inhalte<br />
Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß den gesetzlichen Bestimmungen für eigene Inhalte auf diesen Seiten verantwortlich. In diesem Zusammenhang möchten wir darauf hinweisen, dass wir nicht verpflichtet sind, übermittelte oder gespeicherte Informationen Dritter zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon gemäß §§ 8 bis 10 des Telemediengesetzes (TMG) unberührt.<br /><br />

Haftung für Links<br />
Verantwortlich für die Inhalte externer Links (zu Webseiten Dritter) sind ausschließlich die Betreiber der verlinkten Seiten. Zum Zeitpunkt der Verlinkung waren uns keine Rechtsverstöße ersichtlich. Sollten uns Rechtsverletzungen bekannt werden, werden wir derartige Links umgehend entfernen.<br /><br />

Urheberrecht<br />
Unsere Webseiten und deren Inhalte unterliegen dem deutschen Urheberrecht. Soweit nicht gesetzlich ausdrücklich erlaubt (§§ 44a ff. UrhG), bedarf jede Verwertung, Vervielfältigung oder Verarbeitung urheberrechtlich geschützter Werke auf unseren Webseiten der vorherigen Zustimmung des jeweiligen Rechteinhabers. Einzelne Vervielfältigungen eines Werkes sind nur für den privaten Gebrauch erlaubt und dürfen weder direkt noch indirekt Einnahmen erzielen. Die unbefugte Nutzung urheberrechtlich geschützter Werke ist strafbar (§ 106 UrhG).<br /><br />

<i>Quelle: </i><a href=”http://www.muster-vorlagen.net” target=”_blank”>Rechtliche Hinweise online erstellen - http://www.muster-vorlagen.net</a><br /><br /> Damit müssen lediglich noch die Eingabedaten aus der Tabellenkalkulation auf das Ausgabe-XML der elektronischen Rechnung abgebildet werden. Weil mehrere XML-Ausgabe-Formate unterstützt werden, ist es sinnvoll, die Eingabedaten zunächst auf ein allgemeines internes Format abzubilden, und daraus dann das gewünschte Ausgabeformat zu generieren. Alle diese Informationen werden lediglich für technische Zwecke, zum Beispiel der Analyse technischer Probleme erfasst. Im Ergebnis ist es einfach, die Implementierung synchron mit den aktuellen Standards von Peppol zu halten. Bulgarien<br> Cookie-Einstellungen Cookies sind kleine Informationenhappen, die von einer Web-Site an den Browser gesendet werden. Der Browser speichert diese Informationen in einer Datei oder im Speicher und sendet sie mit allen folgenden Anfragen an den Server zurück, bis entweder der Gültigkeitszeitraum des Cookies abgelaufen ist oder der Browser zur Löschung instruiert wird. Copyright &copy; {copyright_year} {copyright_holder} Doku Download E-Invoice-EU-Dokumentation E-Invoice-EU-Releases E-Invoice-EU auf Github Start Wie fast alle Web-Sites speichert auch diese Informationen über jede Anfragen in Protokolldateien auf dem Web-Server. Der Besuch einer einzigen Seite führt in der Regel zu einer Vielzahl von Einzelanfragen, für Texte, Bilder oder andere Medien, Skriptdateien, Style-Sheets und so weiter. Protokolldateien werden nach spätestens sechs Monaten gelöscht. Geschäftsführer: [% config.legal.manager %] Auch Matomo nutzt Cookies (siehe oben), um Informationen über Ihre Nutzung der Web-Site zu speichern. Die Informationen, die in diesen Cookies gespeichert ist, wird an einen Server der [cantanea EOOD](https://www.cantanea.com/) übermittelt. Matomo speichert keine vollen IP-Adressen, sondern nur einen Teil davon. Zum Beispiel würde die IP-Adresse 12.34.56.78 also 12.34.0.0 gespeichert. Matomo verwendet diese Informationen, um Ihre Nutzung der Web-Site zu analysieren, Berichte über die Website-Aktivitäten und das Publikum der Site zusammenzustellen und stellt weitere die Verwendung der Web-Site betreffende Dienste und die Benutzung des Internets im Allgemeinen zur Verfügung. Beachten Sie bitte, dass ein Unterdrücken der IP-Adresse nicht sinnvoll möglich ist, da diese Adresse zur Rücksendung der Antwort auf die Anfrage benötigt wird. Sinn der IP-Adresse ist es nicht, die Privatsphäre zu beeinträchtigen. Sie ist vielmehr essenziell für jegliche Kommunikation im Internet. Die Dokumentation des Browsers beschreibt, wie sich Cookies allgemein, für bestimmte Web-Sites oder von bestimmten Quellen abschalten lassen. Weiterlesen Quelltext dieser Seite Stern Sterne auf Github Start Inhaltsverzeichnis Die folgenden vom Browser übermittelten Informationen werden gespeichert: Das gewählte interne Format ist größtenteils äquivalent zu [Peppol UBL](https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/). Das hat Vorteile: Die Software wurde unter der Annahme erstellt, dass viele kleine Firmen ihre Rechnungen mit Hilfe einer Tabellenkalkulation wie [LibreOffice](https://www.libreoffice.org/) erstellen. Das bedeutet, dass die Rechnungsdaten schon in strukturierter Form vorliegen. Die Übersetzung für diese Site ist noch nicht fertiggestellt. Noch nicht
übersetzte Passagen werden daher auf Englisch angeboten. Diese Website nutzt Matomo ein Webtracking- und Analysedienst. Navigation ein/aus Typische Beispiele für in Cookies gespeicherte Informationen sind Beispielsweise Spracheinstellungen oder der Inhalt eines Warenkorbes. USt-ID [% config.legal_vat_id %]<br> Aus dem Internet lassen sich keine Daten oder Informationen herunterladen, ohne zuerst Daten oder Informationen zu schicken. Diese Seite informiert darüber, welche Daten im Zusammenhang mit einem Besuch dieser Seite erfasst werden. [% FILTER $Srcset alt=”Flowchart der generellen Funktionsweise von E-Invoice-EU” %]/images/basics/general-mode-of-operation/flow-chart.webp[% END %] [% title = "Unvollständige Übersetzung!" %] Freie und quelloffene Software-Suite zur Generierung von EN16931-konformen Rechnungen (Factur-X/ZUGFeRD, UBL, CII, XRechnung) aus populären Tabellenkalkulationsformaten oder JSON. Impressum Die Software bildet Daten aus einer Tabellenkalkulation auf JSON ab, aus der die E-Rechnung generiert wird. Die Rechnung kann aber auch direkt aus JSON erzeugt werden. Welche privaten Daten werden an diese Website geschickt, und wofür werden sie verwendet? Überschreibbar: Grundlagen Datenschutz E-Invoice-EU Generelle Funktionsweise Impressum Typ: 