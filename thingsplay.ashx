<%@ WebHandler Language="C#" Class="thingsplay" %>

#define TRACE
using System;
using System.IO;
using System.Web;
using System.Xml.Serialization;
using System.Web.Caching;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Text.RegularExpressions;
using System.Net;

public class thingsplay : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        String version = "1.0.0";
        HttpResponse response = context.Response;
        ThingsplayConfig config = ThingsplayConfig.GetCurrentConfig();

        if (!String.IsNullOrEmpty(context.Request.Url.Query))
        {
            string uri = context.Request.Url.Query.Substring(1);
            if (uri.Equals("ping", StringComparison.InvariantCultureIgnoreCase))
            {
                String checkConfig = (config == null) ? "Not Readable" : "OK";
                String checkLog = "";
                if (checkConfig != "OK")
                {
                    checkLog = "Can not verify";
                }
                else
                {
                    String filename = config.url;
                    checkLog = (filename != null && filename != "") ? "OK" : "Not Exist/Readable";
                }

                sendPingResponse(response, version, checkConfig, checkLog);
                return;
            }
        }

        try
        {
            String capteurId = context.Request.Headers["Device-ID"];
            if (String.IsNullOrEmpty(capteurId))
                throw new Exception("capteurId can't be null");

            String location = context.Request.Headers["Device-Loc"];
            if (String.IsNullOrEmpty(location))
                throw new Exception("location can't be null");

            HttpPostedFile hpf = context.Request.Files["file"] as HttpPostedFile;
            if(hpf==null)
                throw new Exception("file can't be null");
            
            if (hpf.ContentLength == 0)
                throw new Exception("file content lenght == 0");
            
            //string savedFileName = Path.Combine(AppDomain.CurrentDomain.BaseDirectory,Path.GetFileName(hpf.FileName));
            //hpf.SaveAs(savedFileName);
            
            

            sendSuccesResponse(response);
        }
        catch(Exception e)
        {
            sendErrorResponse(response,e.StackTrace,e.Message,HttpStatusCode.BadRequest);
        }
    }

    public bool IsReusable
    {
        get { return true; }
    }

    private static void sendPingResponse(HttpResponse response, String version, String config, String log)
    {
        response.AddHeader("Content-Type", "application/json");
        response.AddHeader("Accept-Encoding", "gzip");
        String message = "{ " +
            "\"Thingsplay Version\": \"" + version + "\"" +
            ", \"Configuration File\": \"" + config + "\"" +
            ", \"Url\": \"" + log + "\"" +
            "}";
        response.StatusCode = 200;
        response.Write(message);
        response.Flush();
    }

    private static void sendErrorResponse(HttpResponse response, String errorDetails, String errorMessage, System.Net.HttpStatusCode errorCode)
    {
        String message = string.Format("{{\"error\": {{\"code\": {0},\"message\":\"{1}\"", (int)errorCode, errorMessage);
        if (!string.IsNullOrEmpty(errorDetails))
            message += string.Format(",\"details\":[\"message\":\"{0}\"]", errorDetails);
        message += "}}";
        response.StatusCode = (int)errorCode;
        //custom status description for when the rate limit has been exceeded
        if (response.StatusCode == 429)
        {
            response.StatusDescription = "Too Many Requests";
        }
        //this displays our customized error messages instead of IIS's custom errors
        response.TrySkipIisCustomErrors = true;
        response.Write(message);
        response.Flush();
    }

    private static void sendSuccesResponse(HttpResponse response)
    {
        String message = "{\"success\":true}";
        response.Write(message);
        response.Flush();
    }

}

[XmlRoot("ThingsplayConfig", Namespace ="thingsplay.xsd")]
public class ThingsplayConfig
{
    private static object _lockobject = new object();
    public static ThingsplayConfig LoadProxyConfig(string fileName)
    {
        ThingsplayConfig config = null;
        lock (_lockobject) {
            if (System.IO.File.Exists(fileName)) {
                XmlSerializer reader = new XmlSerializer(typeof(ThingsplayConfig));
                using (System.IO.StreamReader file = new System.IO.StreamReader(fileName)) {
                    try {
                        config = (ThingsplayConfig)reader.Deserialize(file);
                    }
                    catch (Exception ex) {
                        throw ex;
                    }
                }
            }
        }
        return config;
    }

    public static ThingsplayConfig GetCurrentConfig()
    {
        ThingsplayConfig config = HttpRuntime.Cache["thingsplayConfig"] as ThingsplayConfig;
        if (config == null) {
            string fileName = HttpContext.Current.Server.MapPath("thingsplay.config");
            config = LoadProxyConfig(fileName);
            if (config != null) {
                CacheDependency dep = new CacheDependency(fileName);
                HttpRuntime.Cache.Insert("thingsplayConfig", config, dep);
            }
        }
        return config;
    }

    public String url;
    bool enable;

    [XmlAttribute("enable")]
    public bool Enable
    {
        get { return enable; }
        set
        { enable = value; }
    }

    [XmlAttribute("url")]
    public string Url
    {
        get { return url; }
        set
        { url = value; }
    }
}

