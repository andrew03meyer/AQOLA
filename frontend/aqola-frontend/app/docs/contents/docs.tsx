import ContentsBar from "./ContentsBar";
import { OctagonAlert } from "lucide-react";

const Content = () => {
    return (
        <div style={{ height: "100%" }}>
            <div className="heading">
                <div className="tag">Documentation</div>
                <h1>Welcome to the AQOLA Documentation!</h1>
                <p style={{width: "75%"}}>
                    This page is here to help you get started with AQOLA; and to provide information on it's features, the processes and the data used. AQOLA is designed to provide you (the user) with an ability to show real life datasets, in a readable format.
                    Whether this is performing processed to raw data, or just displaying it in a chart, AQOLA is here to help you with that. We hope you enjoy using it as much as we enjoyed building it!
                </p>
            </div>

            <div className="docs-content">
                <ContentsBar />

                <div className="contents-text">

                    <div className="contents-items">
                        {/* <!-- Getting Started --> */}
                        <h2 id="getting-started">Getting Started</h2>
                        <h3>API Documentation</h3>
                        <p><a href="http://aqola.andrewmeyer.co.uk:8000/docs">API Documentation</a></p>
                        <h3>Layout</h3>
                        <p>Here you will find information about the layout of the AQOLA interface and how to navigate through it.</p>
                    </div>

                    <div className="contents-items">
                        <h2 id="data">Data</h2>
                        <p>Here you will find information about the data used in AQOLA, how it's processed, and where we obtained it.</p>
                        <div className="warning">
                            <OctagonAlert size={40} style={{ marginRight: "5px"}} />
                            <p><b>WARNING: </b> Our data is not live. It may be outdated.</p>
                        </div>
                        <h3>Data Sources</h3>
                        <ul>
                            <li><i>Dataset</i> - what the data is about</li>
                            <li><i>Source</i> - where the data is obtained from, including a hyperlink to the source</li>
                            <li><i>Description</i> - a brief description of the dataset, including any relevant details about its content and structure</li>
                            <li><i>Date Range</i> - the time period covered by the dataset, indicating the start and end dates of the data collection</li>
                            <li><i>Data Type</i> - the format in which the data is provided (e.g., CSV, JSON, SQL database, etc.)</li>
                            <li><i>Last Updated</i> - the date when we last updated our local copy of the dataset</li>
                        </ul>
                        <table>
                            <thead>
                                <tr>
                                    <th>Dataset</th>
                                    <th>Source</th>
                                    <th>Description</th>
                                    <th>Date Range</th>
                                    <th>Data Type</th>
                                    <th>Last Updated</th>
                                </tr>
                            </thead>

                            {/* <!-- Crime Data --> */}
                            <tbody>
                                <tr>
                                    <td>Crime</td>
                                    <td><a href="https://data.police.uk/data/">Goverment Data - Police</a></td>
                                    <td>Dataset details can be found <a href="https://data.police.uk/about/">here</a>. For our uses, we utilised data from Kent exclusively.</td>
                                    <td>October 2020 to August 2025</td>
                                    <td>CSV</td>
                                    <td>Late 2025</td>
                                </tr>

                                {/* <!-- School Data --> */}
                                <tr>
                                    <td>Schools</td>
                                    <td><a href="https://www.compare-school-performance.service.gov.uk/schools-by-type?step=default&table=schools&geographic=la&for=primary&region=886&datasetfilter=final">Government Data - Schools</a></td>
                                    <td>Download <a href="https://www.compare-school-performance.service.gov.uk/download-data">here</a>. For our uses, we utilised data from
                                        Kent exclusively.</td>
                                    <td>2010-2025</td>
                                    <td>CSV</td>
                                    <td>Late 2025</td>
                                </tr>

                                {/* <!-- Flood Data --> */}
                                <tr>
                                    <td>Flood</td>
                                    <td><a href="https://data.police.uk/data/">TO BE FILLED OUT</a></td>
                                    <td>TO BE FILLED OUT</td>
                                    <td>XXXX</td>
                                    <td>XXX</td>
                                    <td>XXX</td>
                                </tr>

                                {/* <!-- Housing Price Data --> */}
                                <tr>
                                    <td>House Pricing</td>
                                    <td><a href="https://data.police.uk/data/">TO BE FILLED OUT</a></td>
                                    <td>TO BE FILLED OUT</td>
                                    <td>XXXX</td>
                                    <td>XXX</td>
                                    <td>XXX</td>
                                </tr>

                                {/* <!-- Housing Development Data --> */}
                                <tr>
                                    <td>Housing Developments</td>
                                    <td><a href="https://data.police.uk/data/">TO BE FILLED OUT</a></td>
                                    <td>TO BE FILLED OUT</td>
                                    <td>XXXX</td>
                                    <td>XXX</td>
                                    <td>XXX</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="contents-items">
                        <h2>Charts</h2>
                        <p>Here you will find information about the different charts available in AQOLA, and how to use them.</p>
                        <h3>Bar Charts</h3>
                        <p>Our bar charts are pretty standard. Mostly comprising of a count on the y-axis and a category on the x-axis. We include a legend on the side, to help distinguish between different bars, and we also include tooltips for the same reason.</p>
                        <p>In some charts, we may group together bars along the x-axis. This is to distinguish between different categories. This usually falls down to the different areas you select</p>
                    </div>
                </div>
            </div>
        </div>
);};

export default Content;