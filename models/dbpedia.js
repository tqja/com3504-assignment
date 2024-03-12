const { SparqlEndpointFetcher } = require("fetch-sparql-endpoint");

const fetcher = new SparqlEndpointFetcher();

const fetchFromDbpedia = async (name) => {
// lowercase string, then uppercase first character, as formatted in DBPedia
  if (!name) {
    return [];
  }
  name = name.toLowerCase();
  name = name.replace(name[0], name[0].toUpperCase());
  console.log("Name: ", name);

  return new Promise(async (resolve, reject) => {
    const bindingsArray = [];
    const query = `
    SELECT DISTINCT ?plant ?commonName ?scientificName ?description
      WHERE {
        { ?plant rdfs:label "${name}"@en }
        UNION
        { ?plant dbo:binomial [ rdfs:label "${name}"@en ] }

        ?plant rdf:type dbo:Plant ;
               rdfs:label ?commonName ;
               dbo:binomial [ rdfs:label ?scientificName ] ;
               dbo:abstract ?description .

        FILTER (lang(?commonName) = 'en')
        FILTER (lang(?scientificName) = 'en')
        FILTER (lang(?description) = 'en')
      }
      LIMIT 1`;

    const stream = await fetcher.fetchBindings('https://dbpedia.org/sparql', query);

    stream.on('data', (bindings) => {
      bindingsArray.push(bindings);
    });

    stream.on('error', (err) => {
      reject(err);
    });

    stream.on('end', () => {
      resolve(bindingsArray);
    });
  });
}

module.exports = { fetchFromDbpedia };
