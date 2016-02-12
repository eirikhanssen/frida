<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
   <xsl:output method="html" indent="yes"/>
   <xsl:template match="/">
      <xsl:text disable-output-escaping="yes">&lt;!DOCTYPE html&gt;
</xsl:text>
      <html>
         <head>
            <title>
               <xsl:value-of select="//tittel"/>
            </title>
            <link rel="stylesheet" href="frida2.css"/>
            <script src="frida2.js"></script>
         </head>
         <body>
            <!--<button onclick="initWrapper()">Make Selectable!</button>-->
            <h1 class="sel"><xsl:value-of select="//tittel"/></h1>
            <ul id="datofrida">
               <li><xsl:apply-templates select="//ar"/></li>
               <li><xsl:apply-templates select="//arstallOnline"/></li>
               <li><strong class="sel">FRIDAID <span class="fridaid sel"><xsl:value-of select="//fellesdata/id"/></span></strong></li>
            </ul>
            <div class="clear"/>
            <div class="forfattere">
               <h2>Alle forfattere:</h2>
               <ol>
                  <xsl:for-each select="//rolle[kode='FORFATTER']">
                     <li>
                        <span class="etternavn sel">
                           <xsl:value-of select="../../../etternavn"/>
                        </span>
                        <xsl:text> </xsl:text>
                        <span class="fornavn sel">
                           <xsl:value-of select="../../../fornavn"/>
                        </span>
                     </li>
                  </xsl:for-each>
               </ol>
            </div>
            <div class="forfattere">
               <h2>HiOA-forfattere:</h2>
               <p class="sel">
                  <xsl:for-each select="//rolle[kode='FORFATTER']">
                     <xsl:if test="../institusjon/akronym = 'HIOA'">
                        <span class="fornavn">
                           <xsl:value-of select="../../../fornavn"/>
                        </span>
                        <xsl:text> </xsl:text>
                        <span class="etternavn">
                           <xsl:value-of select="../../../etternavn"/>
                        </span>
                        <xsl:if test="position() != last()">,<xsl:text> </xsl:text></xsl:if>
                     </xsl:if>
                  </xsl:for-each>
               </p>
            </div>
         </body>
      </html>
   </xsl:template>
   
   <xsl:template match="//arstallOnline">
<span class="dato">(...)/<xsl:value-of select="name(../../..)"/>/<xsl:value-of select="name(../..)"/>/<xsl:value-of select="name(..)"/>/arstallOnline: <strong class="important sel"><xsl:value-of select="."/></strong></span>
   </xsl:template>
   
      <xsl:template match="//ar">
<span class="dato">(...)/<xsl:value-of select="name(../../..)"/>/<xsl:value-of select="name(../..)"/>/<xsl:value-of select="name(..)"/>/ar: <strong class="sel"><xsl:value-of select="."/></strong></span>
   </xsl:template>

</xsl:stylesheet>
