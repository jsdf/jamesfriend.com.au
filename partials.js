
module.exports = function(options) {
  return {
    block_1() {
      return `
<!DOCTYPE html>
<!--[if lt IE 7]> <html class="ie6 ie" lang="en" dir="ltr"> <![endif]-->
<!--[if IE 7]>    <html class="ie7 ie" lang="en" dir="ltr"> <![endif]-->
<!--[if IE 8]>    <html class="ie8 ie" lang="en" dir="ltr"> <![endif]-->
<!--[if gt IE 8]> <!--> <html class="" lang="en" dir="ltr"> <!--<![endif]-->
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<link rel="shortcut icon" href="https://jamesfriend.com.au/favicon.ico" type="image/vnd.microsoft.icon"/>
<meta name="generator" content="Drupal 7 (http://drupal.org)"/>
      `;
    },
  };
};