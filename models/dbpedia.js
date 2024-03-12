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
        
        ?plant rdf:type ?type .
        FILTER 
          (?type IN (dbo:Eukaryote, dbo:Plant, dbo:FloweringPlant, dbo:Gnetophytes, dbo:Conifer, dbo:GreenAlga,
          dbo:ClubMoss, dbo:Moss, dbo:Cycad, dbo:Fern, dbo:CultivatedVariety, dbo:Ginkgo)
        )
        
        ?plant rdfs:label ?commonName ;
               dbo:abstract ?description .
        
        OPTIONAL {
          ?plant dbo:binomial [ rdfs:label ?scientificName ] .
          FILTER (lang(?scientificName) = 'en')
        }

        FILTER (lang(?commonName) = 'en')
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
      // if subject has no binomial name, fill it with common name
      if (bindingsArray[0] && !bindingsArray[0].scientificName) {
        bindingsArray[0].scientificName = bindingsArray[0].commonName;
      }
      console.log(bindingsArray);
      resolve(bindingsArray);
    });
  });
}

module.exports = { fetchFromDbpedia };
