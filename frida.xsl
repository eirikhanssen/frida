<xsl:transform
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:prop="http://saxonica.com/ns/html-property"
  xmlns:style="http://saxonica.com/ns/html-style-property"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"  
  xmlns:ixsl="http://saxonica.com/ns/interactiveXSLT"
  xmlns:js="http://saxonica.com/ns/globalJS"
  
  exclude-result-prefixes="xs prop style xs js"
  extension-element-prefixes="ixsl"
  version="2.0">
  
  <xsl:output omit-xml-declaration="yes" method="html"></xsl:output>

  <xsl:template match="/">
    <section id="frida_metadata">
        <h1 id="frida_title" class="sel"><xsl:value-of select="//tittel"/></h1>
        <h2 class="fridaid">
          <span class="sel">FRIDAID 
            <span id="frida_id" class="sel"><xsl:value-of select="//fellesdata/id"/></span></span>
          </h2>

      <h2 id="frida_ar">
          <xsl:variable name="aarstall">
            <xsl:for-each select="//ar|//arstallOnline"><ar><xsl:value-of select="."/></ar></xsl:for-each>
          </xsl:variable>
      	<span class="sel"><xsl:value-of select="min($aarstall/ar)"/></span>
        </h2>
      <h2>
        <xsl:variable name="issns">
          <xsl:sequence select="//issn"/>
        </xsl:variable>
        <xsl:choose>
          <xsl:when test="every $n in $issns/issn satisfies $n eq $issns/issn[1]">
			<xsl:text>ISSN: </xsl:text><span id="frida_issn" class="sel"><xsl:value-of select="$issns/issn[1]"/></span>
		</xsl:when>
		<xsl:otherwise>
			<strong><xsl:text>Different ISSN present: </xsl:text></strong>
			<xsl:for-each select="$issns/issn">
				<span class="sel"><xsl:value-of select="."/></span>
				<xsl:if test="position() ne last()"><xsl:text>, </xsl:text></xsl:if>
			</xsl:for-each>
		</xsl:otherwise>
        </xsl:choose>

      </h2>
        <h2>Alle forfattere</h2>
          <ol id="frida_authors_all">
		<xsl:variable name="all_authors_with_doubles">
			<xsl:sequence select="//person[descendant::rolle/kode = 'FORFATTER']"></xsl:sequence>
		</xsl:variable>
		<xsl:for-each select="$all_authors_with_doubles/person">
			<li class="author">
				<span class="lastname sel"><xsl:value-of select="etternavn"/></span><xsl:text> </xsl:text>
				<span class="firstname sel"><xsl:value-of select="fornavn"/></span>
			</li>
		</xsl:for-each>
          </ol>

          <xsl:variable name="hioa_authors_seq">
            <xsl:for-each select="//rolle[kode='FORFATTER']">
              <xsl:if test="../institusjon/akronym = 'HIOA'">
                <author><xsl:value-of select="../../../fornavn"/><xsl:text> </xsl:text><xsl:value-of select="../../../etternavn"/></author>
              </xsl:if>
            </xsl:for-each>
          </xsl:variable>

        <xsl:variable name="hioa_authors">
          <xsl:for-each select="$hioa_authors_seq/author">
            <xsl:value-of select="."/><xsl:if test="position() != last()"><xsl:text>, </xsl:text></xsl:if>
          </xsl:for-each>
        </xsl:variable>

      <h2>HiOA-forfattere</h2>
      <p id="frida_authors_hioa" class="sel"><xsl:value-of select="$hioa_authors"/></p>
    </section>
  </xsl:template>
</xsl:transform>
